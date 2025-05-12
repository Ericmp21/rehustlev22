import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AnalyzeDeal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for form data
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    propertyType: 'single-family',
    purchasePrice: '',
    afterRepairValue: '',
    rehabCost: '',
    closingCosts: '',
    holdingCosts: '',
    rentalIncome: '',
    otherIncome: '',
    vacancyRate: '5',
    propertyManagement: '10',
    propertyTaxes: '',
    insurance: '',
    maintenance: '5',
    utilities: '',
    hoaFees: '',
    exitStrategy: 'buy-and-hold'
  });
  
  // State for calculated values
  const [calculatedValues, setCalculatedValues] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // If loading, display loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Convert string values to numbers for calculation
    const data = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      afterRepairValue: parseFloat(formData.afterRepairValue) || 0,
      rehabCost: parseFloat(formData.rehabCost) || 0,
      closingCosts: parseFloat(formData.closingCosts) || 0,
      holdingCosts: parseFloat(formData.holdingCosts) || 0,
      rentalIncome: parseFloat(formData.rentalIncome) || 0,
      otherIncome: parseFloat(formData.otherIncome) || 0,
      vacancyRate: parseFloat(formData.vacancyRate) || 5,
      propertyManagement: parseFloat(formData.propertyManagement) || 10,
      propertyTaxes: parseFloat(formData.propertyTaxes) || 0,
      insurance: parseFloat(formData.insurance) || 0,
      maintenance: parseFloat(formData.maintenance) || 5,
      utilities: parseFloat(formData.utilities) || 0,
      hoaFees: parseFloat(formData.hoaFees) || 0,
    };
    
    // Calculate investment metrics
    const totalInvestment = data.purchasePrice + data.rehabCost + data.closingCosts;
    const monthlyIncome = data.rentalIncome + data.otherIncome;
    const vacancyLoss = (monthlyIncome * data.vacancyRate) / 100;
    const managementFee = (monthlyIncome * data.propertyManagement) / 100;
    const maintenanceCost = (monthlyIncome * data.maintenance) / 100;
    const monthlyExpenses = vacancyLoss + managementFee + data.propertyTaxes / 12 + 
                           data.insurance / 12 + maintenanceCost + data.utilities + data.hoaFees;
    const monthlyCashFlow = monthlyIncome - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;
    const capRate = (annualCashFlow / data.purchasePrice) * 100;
    
    // Calculate Sniper Score (a proprietary scoring system out of 100)
    // This is a simplified version - in a real app, you'd have a more sophisticated algorithm
    let sniperScore = 0;
    
    // Cash flow component (0-40 points)
    if (monthlyCashFlow > 0) {
      const cashFlowScore = Math.min(monthlyCashFlow / 50 * 10, 40);
      sniperScore += cashFlowScore;
    }
    
    // Cash on Cash Return component (0-30 points)
    if (cashOnCashReturn > 0) {
      const cocScore = Math.min(cashOnCashReturn * 2, 30);
      sniperScore += cocScore;
    }
    
    // ARV to Purchase Price ratio component (0-20 points)
    const arvRatio = data.afterRepairValue / data.purchasePrice;
    if (arvRatio > 1) {
      const arvScore = Math.min((arvRatio - 1) * 40, 20);
      sniperScore += arvScore;
    }
    
    // Cap Rate component (0-10 points)
    if (capRate > 0) {
      const capRateScore = Math.min(capRate, 10);
      sniperScore += capRateScore;
    }
    
    // Round to the nearest integer
    sniperScore = Math.round(sniperScore);
    
    // Determine deal rating based on Sniper Score
    let dealRating = 'Poor';
    if (sniperScore >= 80) {
      dealRating = 'Excellent';
    } else if (sniperScore >= 70) {
      dealRating = 'Great';
    } else if (sniperScore >= 60) {
      dealRating = 'Good';
    } else if (sniperScore >= 50) {
      dealRating = 'Fair';
    }
    
    // Set calculated values
    setCalculatedValues({
      totalInvestment,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
      sniperScore,
      dealRating
    });
    
    setIsCalculating(false);
  };
  
  // Save the deal (in a real app, this would save to a database)
  const saveDeal = () => {
    alert('In a production app, this would save the deal to your account!');
  };
  
  return (
    <>
      <Head>
        <title>Analyze Deal | RE Hustle</title>
        <meta name="description" content="Analyze real estate deals and calculate the Sniper Score to make data-driven investment decisions." />
      </Head>
      
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header/Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">RE Hustle</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link href="/dashboard" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/analyze-deal" className="border-green-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Analyze Deal
                  </Link>
                  <Link href="/saved-deals" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Saved Deals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analyze Deal</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  {calculatedValues ? (
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-xl font-semibold mb-6">Deal Analysis Results</h2>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                        <div className="flex items-center mb-4">
                          <div className="text-4xl font-bold text-green-600 dark:text-green-400">{calculatedValues.sniperScore}</div>
                          <div className="ml-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Sniper Score</div>
                            <div className="text-lg font-semibold">{calculatedValues.dealRating} Deal</div>
                          </div>
                          <div className="ml-auto">
                            <button
                              onClick={saveDeal}
                              className="btn-primary"
                            >
                              Save Deal
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Investment</div>
                            <div className="text-lg font-semibold">${calculatedValues.totalInvestment.toLocaleString()}</div>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Cash Flow</div>
                            <div className="text-lg font-semibold">${calculatedValues.monthlyCashFlow.toLocaleString()}</div>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Cash on Cash Return</div>
                            <div className="text-lg font-semibold">{calculatedValues.cashOnCashReturn.toFixed(2)}%</div>
                          </div>
                          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Cap Rate</div>
                            <div className="text-lg font-semibold">{calculatedValues.capRate.toFixed(2)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Income</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>Monthly Rental Income</div>
                              <div>${parseFloat(formData.rentalIncome).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Other Monthly Income</div>
                              <div>${parseFloat(formData.otherIncome).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <div>Total Monthly Income</div>
                              <div>${calculatedValues.monthlyIncome.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6 mb-3">Expenses</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>Vacancy ({formData.vacancyRate}%)</div>
                              <div>${((calculatedValues.monthlyIncome * parseFloat(formData.vacancyRate)) / 100).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Property Management ({formData.propertyManagement}%)</div>
                              <div>${((calculatedValues.monthlyIncome * parseFloat(formData.propertyManagement)) / 100).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Property Taxes (Monthly)</div>
                              <div>${(parseFloat(formData.propertyTaxes) / 12).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Insurance (Monthly)</div>
                              <div>${(parseFloat(formData.insurance) / 12).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Maintenance ({formData.maintenance}%)</div>
                              <div>${((calculatedValues.monthlyIncome * parseFloat(formData.maintenance)) / 100).toLocaleString()}</div>
                            </div>
                            {parseFloat(formData.utilities) > 0 && (
                              <div className="flex justify-between">
                                <div>Utilities</div>
                                <div>${parseFloat(formData.utilities).toLocaleString()}</div>
                              </div>
                            )}
                            {parseFloat(formData.hoaFees) > 0 && (
                              <div className="flex justify-between">
                                <div>HOA Fees</div>
                                <div>${parseFloat(formData.hoaFees).toLocaleString()}</div>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold">
                              <div>Total Monthly Expenses</div>
                              <div>${calculatedValues.monthlyExpenses.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">Property Details</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>Property Name</div>
                              <div>{formData.propertyName}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Address</div>
                              <div>{formData.address}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Property Type</div>
                              <div className="capitalize">{formData.propertyType.replace('-', ' ')}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Exit Strategy</div>
                              <div className="capitalize">{formData.exitStrategy.replace('-', ' ')}</div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6 mb-3">Investment Details</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>Purchase Price</div>
                              <div>${parseFloat(formData.purchasePrice).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>After Repair Value</div>
                              <div>${parseFloat(formData.afterRepairValue).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Rehab Cost</div>
                              <div>${parseFloat(formData.rehabCost).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Closing Costs</div>
                              <div>${parseFloat(formData.closingCosts).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Holding Costs</div>
                              <div>${parseFloat(formData.holdingCosts).toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <div>Total Investment</div>
                              <div>${calculatedValues.totalInvestment.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6 mb-3">Return Metrics</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <div>Monthly Cash Flow</div>
                              <div>${calculatedValues.monthlyCashFlow.toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Annual Cash Flow</div>
                              <div>${calculatedValues.annualCashFlow.toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Cash on Cash Return</div>
                              <div>{calculatedValues.cashOnCashReturn.toFixed(2)}%</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Cap Rate</div>
                              <div>{calculatedValues.capRate.toFixed(2)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <button
                          onClick={() => setCalculatedValues(null)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Back to Form
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h2 className="text-xl font-semibold mb-6">Property Information</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="propertyName" className="form-label">Property Name</label>
                              <input
                                type="text"
                                id="propertyName"
                                name="propertyName"
                                value={formData.propertyName}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="address" className="form-label">Property Address</label>
                              <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="propertyType" className="form-label">Property Type</label>
                              <select
                                id="propertyType"
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              >
                                <option value="single-family">Single-Family</option>
                                <option value="multi-family">Multi-Family</option>
                                <option value="condo">Condo</option>
                                <option value="townhouse">Townhouse</option>
                                <option value="commercial">Commercial</option>
                                <option value="short-term-rental">Short-Term Rental</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="exitStrategy" className="form-label">Exit Strategy</label>
                              <select
                                id="exitStrategy"
                                name="exitStrategy"
                                value={formData.exitStrategy}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              >
                                <option value="buy-and-hold">Buy and Hold</option>
                                <option value="fix-and-flip">Fix and Flip</option>
                                <option value="brrrr">BRRRR</option>
                                <option value="wholesale">Wholesale</option>
                              </select>
                            </div>
                          </div>
                          
                          <h2 className="text-xl font-semibold mt-8 mb-6">Purchase & Rehab</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="purchasePrice" className="form-label">Purchase Price ($)</label>
                              <input
                                type="number"
                                id="purchasePrice"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="afterRepairValue" className="form-label">After Repair Value (ARV) ($)</label>
                              <input
                                type="number"
                                id="afterRepairValue"
                                name="afterRepairValue"
                                value={formData.afterRepairValue}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="rehabCost" className="form-label">Rehab Cost ($)</label>
                              <input
                                type="number"
                                id="rehabCost"
                                name="rehabCost"
                                value={formData.rehabCost}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="closingCosts" className="form-label">Closing Costs ($)</label>
                              <input
                                type="number"
                                id="closingCosts"
                                name="closingCosts"
                                value={formData.closingCosts}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="holdingCosts" className="form-label">Holding Costs ($)</label>
                              <input
                                type="number"
                                id="holdingCosts"
                                name="holdingCosts"
                                value={formData.holdingCosts}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-xl font-semibold mb-6">Income</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="rentalIncome" className="form-label">Monthly Rental Income ($)</label>
                              <input
                                type="number"
                                id="rentalIncome"
                                name="rentalIncome"
                                value={formData.rentalIncome}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="otherIncome" className="form-label">Other Monthly Income ($)</label>
                              <input
                                type="number"
                                id="otherIncome"
                                name="otherIncome"
                                value={formData.otherIncome}
                                onChange={handleChange}
                                className="input-field w-full"
                              />
                            </div>
                          </div>
                          
                          <h2 className="text-xl font-semibold mt-8 mb-6">Expenses</h2>
                          
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="vacancyRate" className="form-label">Vacancy Rate (%)</label>
                              <input
                                type="number"
                                id="vacancyRate"
                                name="vacancyRate"
                                value={formData.vacancyRate}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="propertyManagement" className="form-label">Property Management (%)</label>
                              <input
                                type="number"
                                id="propertyManagement"
                                name="propertyManagement"
                                value={formData.propertyManagement}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="propertyTaxes" className="form-label">Annual Property Taxes ($)</label>
                              <input
                                type="number"
                                id="propertyTaxes"
                                name="propertyTaxes"
                                value={formData.propertyTaxes}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="insurance" className="form-label">Annual Insurance ($)</label>
                              <input
                                type="number"
                                id="insurance"
                                name="insurance"
                                value={formData.insurance}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="maintenance" className="form-label">Maintenance (%)</label>
                              <input
                                type="number"
                                id="maintenance"
                                name="maintenance"
                                value={formData.maintenance}
                                onChange={handleChange}
                                className="input-field w-full"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="utilities" className="form-label">Monthly Utilities ($)</label>
                              <input
                                type="number"
                                id="utilities"
                                name="utilities"
                                value={formData.utilities}
                                onChange={handleChange}
                                className="input-field w-full"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="hoaFees" className="form-label">Monthly HOA Fees ($)</label>
                              <input
                                type="number"
                                id="hoaFees"
                                name="hoaFees"
                                value={formData.hoaFees}
                                onChange={handleChange}
                                className="input-field w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isCalculating}
                        >
                          {isCalculating ? 'Calculating...' : 'Calculate Sniper Score'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}