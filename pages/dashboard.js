import { getSession } from "next-auth/react";

export default function Dashboard({ user }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
      <p>This is your RE Hustle V2 dashboard. More tools coming soon!</p>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}