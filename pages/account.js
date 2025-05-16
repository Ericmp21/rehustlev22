import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Account({ user, trialStatus }) {
  const [accountData, setAccountData] = useState({
    fullName: '',
    phoneNumber: '',
    preferredCRM: 'None',
    crmAPIKey: '',
    syncAutomatically: false
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/account/settings');
        if (!response.ok) throw new Error('Failed to load settings');

        const data = await response.json();
        setAccountData({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          preferredCRM: data.crmPreferences?.preferredCRM || 'None',
          crmAPIKey: data.crmPreferences?.crmAPIKey || '',
          syncAutomatically: data.crmPreferences?.syncAutomatically || false
        });
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountData({
      ...accountData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);

    const payload = {
      fullName: accountData.fullName,
      phoneNumber: accountData.phoneNumber,
      crmPreferences: {
        preferredCRM: accountData.preferredCRM,
        crmAPIKey: accountData.crmAPIKey,
        syncAutomatically: accountData.syncAutomatically
      }
    };

    try {
      const response = await fetch('/api/account/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="p-8 text-white">
      <Head>
        <title>Account Settings</title>
      </Head>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Full Name</label>
            <input
              name="fullName"
              type="text"
              value={accountData.fullName}
              onChange={handleChange}
              className="w-full p-2 rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-2">Phone Number</label>
            <input
              name="phoneNumber"
              type="text"
              value={accountData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-2">Preferred CRM</label>
            <select
              name="preferredCRM"
              value={accountData.preferredCRM}
              onChange={handleChange}
              className="w-full p-2 rounded text-black"
            >
              <option value="None">None</option>
              <option value="GoHighLevel">GoHighLevel</option>
              <option value="Podio">Podio</option>
              <option value="Notion">Notion</option>
              <option value="REI Reply">REI Reply</option>
            </select>
          </div>

          {accountData.preferredCRM !== 'None' && (
            <>
              <div>
                <label className="block mb-2">CRM API Key</label>
                <input
                  name="crmAPIKey"
                  type="text"
                  value={accountData.crmAPIKey}
                  onChange={handleChange}
                  className="w-full p-2 rounded text-black"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="syncAutomatically"
                  checked={accountData.syncAutomatically}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label>Sync new deals automatically</label>
              </div>
            </>
          )}

          {saveSuccess && (
            <div className="text-green-400">Settings saved successfully!</div>
          )}

          <button
            type="submit"
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  return {
    props: { user: session.user }
  };
}
