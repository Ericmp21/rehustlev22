import { useState, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { syncDealToCRM } from "../lib/crmSync";

// Property type options
const PROPERTY_TYPES = {
  LAND: "Land",
  RESIDENTIAL: "Residential",
  MULTI_FAMILY: "Multi-Family",
  COMMERCIAL: "Commercial"
};

// Form components for each property type
const LandForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Purchase Price ($)</label>
        <input 
          name="purchase_price" 
          type="number" 
          placeholder="Enter purchase price" 
          onChange={onChange}
          value={data.purchase_price || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Market Value ($)</label>
        <input 
          name="market_value" 
          type="number" 
          placeholder="Enter market value" 
          onChange={onChange}
          value={data.market_value || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Property Address</label>
      <input 
        name="address" 
        type="text" 
        placeholder="Enter property address" 
        onChange={onChange}
        value={data.address || ""} 
        className="w-full p-2 rounded text-black" 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Seller Motivation</label>
        <select 
          name="seller_motivation" 
          onChange={onChange} 
          value={data.seller_motivation || "Warm"}
          className="w-full p-2 rounded text-black"
        >
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Road Access</label>
        <select 
          name="road_access" 
          onChange={onChange} 
          value={data.road_access || "Yes"}
          className="w-full p-2 rounded text-black"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Utilities</label>
        <select 
          name="utilities" 
          onChange={onChange} 
          value={data.utilities || "Yes"}
          className="w-full p-2 rounded text-black"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Environmental Risk</label>
      <select 
        name="environmental_risk" 
        onChange={onChange} 
        value={data.environmental_risk || "Low"}
        className="w-full p-2 rounded text-black"
      >
        <option value="None">None (0%)</option>
        <option value="Low">Low (5%)</option>
        <option value="Medium">Medium (10%)</option>
        <option value="High">High (20%)</option>
      </select>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Zoning Notes</label>
      <textarea 
        name="zoning_notes" 
        placeholder="Enter any zoning details or notes" 
        onChange={onChange}
        value={data.zoning_notes || ""} 
        className="w-full p-2 rounded text-black h-16" 
      />
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Additional Notes</label>
      <textarea 
        name="additional_notes" 
        placeholder="Enter any additional observations or notes about the property" 
        onChange={onChange}
        value={data.additional_notes || ""} 
        className="w-full p-2 rounded text-black h-24" 
      />
    </div>
  </>
);

const ResidentialForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">ARV ($)</label>
        <input 
          name="arv" 
          type="number" 
          placeholder="After Repair Value" 
          onChange={onChange}
          value={data.arv || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Repair Costs ($)</label>
        <input 
          name="repair_costs" 
          type="number" 
          placeholder="Estimated repairs" 
          onChange={onChange}
          value={data.repair_costs || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Property Address</label>
      <input 
        name="address" 
        type="text" 
        placeholder="Enter property address" 
        onChange={onChange}
        value={data.address || ""} 
        className="w-full p-2 rounded text-black" 
      />
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Comps</label>
      <input 
        name="comps" 
        type="text" 
        placeholder="Comparable properties (e.g., 123 Main St: $250k, 456 Oak Ave: $265k)" 
        onChange={onChange}
        value={data.comps || ""} 
        className="w-full p-2 rounded text-black" 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Distress Signals</label>
        <select 
          name="distress_signals" 
          onChange={onChange} 
          value={data.distress_signals || "None"}
          className="w-full p-2 rounded text-black"
        >
          <option value="None">None</option>
          <option value="Tax Lien">Tax Lien</option>
          <option value="Code Violation">Code Violation</option>
          <option value="Pre-Foreclosure">Pre-Foreclosure</option>
          <option value="Probate">Probate</option>
          <option value="Multiple">Multiple Issues</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Days on Market</label>
        <input 
          name="days_on_market" 
          type="number" 
          placeholder="Days property has been listed" 
          onChange={onChange}
          value={data.days_on_market || ""} 
          className="w-full p-2 rounded text-black" 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Neighborhood Score (1-10)</label>
      <input 
        name="neighborhood_score" 
        type="range" 
        min="1" 
        max="10" 
        onChange={onChange}
        value={data.neighborhood_score || "5"} 
        className="w-full" 
      />
      <div className="flex justify-between text-xs mt-1">
        <span>Poor (1)</span>
        <span>Average (5)</span>
        <span>Excellent (10)</span>
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Additional Notes</label>
      <textarea 
        name="additional_notes" 
        placeholder="Enter any additional observations or notes about the property" 
        onChange={onChange}
        value={data.additional_notes || ""} 
        className="w-full p-2 rounded text-black h-24" 
      />
    </div>
  </>
);

const MultiFamilyForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Unit Count</label>
        <input 
          name="unit_count" 
          type="number" 
          placeholder="Number of units" 
          onChange={onChange}
          value={data.unit_count || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Monthly Rent Roll ($)</label>
        <input 
          name="monthly_rent_roll" 
          type="number" 
          placeholder="Total monthly income" 
          onChange={onChange}
          value={data.monthly_rent_roll || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Monthly Expenses ($)</label>
        <input 
          name="expenses" 
          type="number" 
          placeholder="Total monthly expenses" 
          onChange={onChange}
          value={data.expenses || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Property Address</label>
      <input 
        name="address" 
        type="text" 
        placeholder="Enter property address" 
        onChange={onChange}
        value={data.address || ""} 
        className="w-full p-2 rounded text-black" 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Cap Rate (%)</label>
        <input 
          name="cap_rate" 
          type="number" 
          step="0.1" 
          placeholder="Market cap rate (e.g., 6.5)" 
          onChange={onChange}
          value={data.cap_rate || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Vacancy Rate (%)</label>
        <input 
          name="vacancy_rate" 
          type="number" 
          step="0.1" 
          placeholder="Current vacancy percentage" 
          onChange={onChange}
          value={data.vacancy_rate || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Stabilization Time (months)</label>
        <input 
          name="stabilization_time" 
          type="number" 
          placeholder="Months until fully stabilized" 
          onChange={onChange}
          value={data.stabilization_time || ""} 
          className="w-full p-2 rounded text-black" 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Purchase Price ($)</label>
      <input 
        name="purchase_price" 
        type="number" 
        placeholder="Purchase price" 
        onChange={onChange}
        value={data.purchase_price || ""} 
        className="w-full p-2 rounded text-black" 
        required 
      />
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Additional Notes</label>
      <textarea 
        name="additional_notes" 
        placeholder="Enter any additional observations or notes about the property" 
        onChange={onChange}
        value={data.additional_notes || ""} 
        className="w-full p-2 rounded text-black h-24" 
      />
    </div>
  </>
);

const CommercialForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">NOI ($)</label>
        <input 
          name="noi" 
          type="number" 
          placeholder="Net Operating Income" 
          onChange={onChange}
          value={data.noi || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Market Cap Rate (%)</label>
        <input 
          name="market_cap_rate" 
          type="number" 
          step="0.1" 
          placeholder="Market cap rate (e.g., 7.0)" 
          onChange={onChange}
          value={data.market_cap_rate || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Property Address</label>
      <input 
        name="address" 
        type="text" 
        placeholder="Enter property address" 
        onChange={onChange}
        value={data.address || ""} 
        className="w-full p-2 rounded text-black" 
      />
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Lease Terms</label>
      <textarea 
        name="lease_terms" 
        placeholder="Describe current lease terms, expiration dates, tenant quality" 
        onChange={onChange}
        value={data.lease_terms || ""} 
        className="w-full p-2 rounded text-black h-24" 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Vacancy Rate (%)</label>
        <input 
          name="vacancy_rate" 
          type="number" 
          step="0.1" 
          placeholder="Current vacancy percentage" 
          onChange={onChange}
          value={data.vacancy_rate || ""} 
          className="w-full p-2 rounded text-black" 
          required 
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Location Score (1-10)</label>
        <input 
          name="location_score" 
          type="range" 
          min="1" 
          max="10" 
          onChange={onChange}
          value={data.location_score || "5"} 
          className="w-full" 
        />
        <div className="flex justify-between text-xs mt-1">
          <span>Poor (1)</span>
          <span>Prime (10)</span>
        </div>
      </div>
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Purchase Price ($)</label>
      <input 
        name="purchase_price" 
        type="number" 
        placeholder="Purchase price" 
        onChange={onChange}
        value={data.purchase_price || ""} 
        className="w-full p-2 rounded text-black" 
        required 
      />
    </div>
    
    <div>
      <label className="block mb-2 text-sm font-medium">Additional Notes</label>
      <textarea 
        name="additional_notes" 
        placeholder="Enter any additional observations or notes about the property" 
        onChange={onChange}
        value={data.additional_notes || ""} 
        className="w-full p-2 rounded text-black h-24" 
      />
    </div>
  </>
);

// Main component
export default function AnalyzeDeal({ user }) {
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES.LAND);
  
  // Initialize form data for each property type
  const [formData, setFormData] = useState({
    [PROPERTY_TYPES.LAND]: {},
    [PROPERTY_TYPES.RESIDENTIAL]: {},
    [PROPERTY_TYPES.MULTI_FAMILY]: {},
    [PROPERTY_TYPES.COMMERCIAL]: {},
  });
  
  const [result, setResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [crmSuccess, setCrmSuccess] = useState(false);
  const [crmError, setCrmError] = useState(null);
  const [accountData, setAccountData] = useState(null);

  // Load account data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccountData = localStorage.getItem('accountData') 
        ? JSON.parse(localStorage.getItem('accountData')) 
        : null;
      
      setAccountData(savedAccountData);
    }
  }, []);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [propertyType]: {
        ...formData[propertyType],
        [name]: value,
      },
    });
  };

  // Calculate score based on property type
  const calculateScore = (type, data) => {
    let sniperScore = 0;
    let riskLevel = "";
    let exitStrategy = "";
    let recommendedOffer = 0;
    
    // Different calculation logic based on property type
    switch (type) {
      case PROPERTY_TYPES.LAND:
        {
          // Parse numeric values
          const purchasePrice = parseFloat(data.purchase_price);
          const marketValue = parseFloat(data.market_value);
          
          // Base score calculation - profit margin
          let baseScore = ((marketValue - purchasePrice) / marketValue) * 100;
          
          // Adjustments based on other factors
          let adjustments = 0;
          
          // Seller motivation adjustment
          if (data.seller_motivation === "Hot") adjustments += 15;
          else if (data.seller_motivation === "Warm") adjustments += 7;
          
          // Road access adjustment
          adjustments += data.road_access === "Yes" ? 10 : -15;
          
          // Utilities adjustment
          adjustments += data.utilities === "Yes" ? 10 : -10;
          
          // Environmental risk adjustment
          if (data.environmental_risk === "High") adjustments -= 20;
          else if (data.environmental_risk === "Medium") adjustments -= 10;
          else if (data.environmental_risk === "Low") adjustments -= 5;
          
          // Calculate final score with adjustments
          sniperScore = Math.round(baseScore + adjustments);
          
          // Ensure score is between 0 and 100
          sniperScore = Math.min(100, Math.max(0, sniperScore));
          
          // Set risk level based on score
          if (sniperScore > 70) {
            riskLevel = "Green";
            exitStrategy = "Flip";
          } else if (sniperScore >= 40) {
            riskLevel = "Yellow";
            exitStrategy = "Hold or Wholesale";
          } else {
            riskLevel = "Red";
            exitStrategy = "Pass";
          }
          
          // Calculate recommended offer
          recommendedOffer = (marketValue * 0.7).toFixed(2);
        }
        break;
        
      case PROPERTY_TYPES.RESIDENTIAL:
        {
          // Parse numeric values
          const arv = parseFloat(data.arv);
          const repairCosts = parseFloat(data.repair_costs);
          const domValue = parseFloat(data.days_on_market) || 0;
          const neighborhoodScore = parseFloat(data.neighborhood_score) || 5;
          
          // Maximum Allowable Offer calculation
          const mao = arv * 0.7 - repairCosts;
          
          // Base score - ARV margin (70% rule)
          let baseScore = ((arv - repairCosts - mao) / arv) * 70;
          
          // Adjustments
          let adjustments = 0;
          
          // Days on Market adjustment (longer = better deal potentially)
          if (domValue > 120) adjustments -= 10;
          else if (domValue > 90) adjustments -= 7;
          else if (domValue > 60) adjustments -= 5;
          else if (domValue > 30) adjustments -= 2;
          
          // Distress signals adjustment
          if (data.distress_signals === "Multiple") adjustments += 15;
          else if (data.distress_signals === "Pre-Foreclosure" || 
                  data.distress_signals === "Tax Lien") adjustments += 10;
          else if (data.distress_signals === "Code Violation" ||
                  data.distress_signals === "Probate") adjustments += 5;
          
          // Neighborhood score adjustment
          adjustments += (neighborhoodScore - 5); // -4 to +5 range
          
          // Calculate final score
          sniperScore = Math.round(baseScore + adjustments);
          
          // Ensure score is between 0 and 100
          sniperScore = Math.min(100, Math.max(0, sniperScore));
          
          // Set risk level and exit strategy
          if (sniperScore > 70) {
            riskLevel = "Green";
            exitStrategy = "Fix & Flip";
          } else if (sniperScore >= 40) {
            riskLevel = "Yellow";
            exitStrategy = "BRRRR or Wholesale";
          } else {
            riskLevel = "Red";
            exitStrategy = "Pass";
          }
          
          // Set recommended offer
          recommendedOffer = mao.toFixed(2);
        }
        break;
        
      case PROPERTY_TYPES.MULTI_FAMILY:
        {
          // Parse numeric values
          const unitCount = parseInt(data.unit_count) || 0;
          const monthlyRent = parseFloat(data.monthly_rent_roll) || 0;
          const monthlyExpenses = parseFloat(data.expenses) || 0;
          const capRate = parseFloat(data.cap_rate) || 7.0;
          const vacancyRate = parseFloat(data.vacancy_rate) || 0;
          const stabilizationTime = parseInt(data.stabilization_time) || 0;
          const purchasePrice = parseFloat(data.purchase_price) || 0;
          
          // Calculate monthly cash flow
          const cashFlow = monthlyRent - monthlyExpenses;
          
          // Calculate annual NOI
          const annualNOI = (monthlyRent * (1 - vacancyRate/100) - monthlyExpenses) * 12;
          
          // Calculate property value based on cap rate
          const propertyValue = annualNOI / (capRate/100);
          
          // Calculate equity multiple
          const equityMultiple = propertyValue / purchasePrice;
          
          // Base score calculation - value vs purchase price
          let baseScore = ((propertyValue - purchasePrice) / propertyValue) * 60;
          
          // Cash flow score component
          const cashFlowPerUnit = cashFlow / unitCount;
          let cashFlowScore = 0;
          
          if (cashFlowPerUnit >= 300) cashFlowScore = 25;
          else if (cashFlowPerUnit >= 200) cashFlowScore = 20;
          else if (cashFlowPerUnit >= 100) cashFlowScore = 15;
          else if (cashFlowPerUnit > 0) cashFlowScore = 10;
          
          // Vacancy risk
          let vacancyScore = 0;
          if (vacancyRate < 5) vacancyScore = 10;
          else if (vacancyRate < 8) vacancyScore = 5;
          else if (vacancyRate > 15) vacancyScore = -10;
          
          // Stabilization time
          let stabilizationScore = 0;
          if (stabilizationTime > 12) stabilizationScore = -10;
          else if (stabilizationTime > 6) stabilizationScore = -5;
          
          // Final score calculation
          sniperScore = Math.round(baseScore + cashFlowScore + vacancyScore + stabilizationScore);
          
          // Ensure score is between 0 and 100
          sniperScore = Math.min(100, Math.max(0, sniperScore));
          
          // Set risk level
          if (sniperScore > 70) {
            riskLevel = "Green";
            exitStrategy = "Buy & Hold";
          } else if (sniperScore >= 40) {
            riskLevel = "Yellow";
            exitStrategy = "Value-Add Opportunity";
          } else {
            riskLevel = "Red";
            exitStrategy = "Pass";
          }
          
          // Recommended offer based on cap rate + premium/discount
          let offerCapRate = capRate;
          if (sniperScore > 70) offerCapRate -= 0.5; // Premium for great deals
          else if (sniperScore < 40) offerCapRate += 1.0; // Discount for risky deals
          
          recommendedOffer = (annualNOI / (offerCapRate/100)).toFixed(2);
        }
        break;
        
      case PROPERTY_TYPES.COMMERCIAL:
        {
          // Parse numeric values
          const noi = parseFloat(data.noi) || 0;
          const marketCapRate = parseFloat(data.market_cap_rate) || 0;
          const vacancyRate = parseFloat(data.vacancy_rate) || 0;
          const locationScore = parseInt(data.location_score) || 5;
          const purchasePrice = parseFloat(data.purchase_price) || 0;
          
          // Property value based on cap rate
          const propertyValue = noi / (marketCapRate/100);
          
          // Base score - value vs purchase price
          let baseScore = ((propertyValue - purchasePrice) / propertyValue) * 60;
          
          // Location adjustment
          const locationAdjustment = (locationScore - 5) * 3; // -12 to +15 range
          
          // Vacancy adjustment
          let vacancyAdjustment = 0;
          if (vacancyRate === 0) vacancyAdjustment = 15;
          else if (vacancyRate < 5) vacancyAdjustment = 10;
          else if (vacancyRate < 10) vacancyAdjustment = 5;
          else if (vacancyRate > 20) vacancyAdjustment = -15;
          else if (vacancyRate > 15) vacancyAdjustment = -10;
          
          // Lease terms factor - basic check for presence of lease info
          const leaseAdjustment = data.lease_terms && data.lease_terms.length > 50 ? 10 : 0;
          
          // Calculate final score
          sniperScore = Math.round(baseScore + locationAdjustment + vacancyAdjustment + leaseAdjustment);
          
          // Ensure score is between 0 and 100
          sniperScore = Math.min(100, Math.max(0, sniperScore));
          
          // Set risk level
          if (sniperScore > 70) {
            riskLevel = "Green";
            exitStrategy = "Long-term Hold";
          } else if (sniperScore >= 40) {
            riskLevel = "Yellow";
            exitStrategy = "Reposition & Hold";
          } else {
            riskLevel = "Red";
            exitStrategy = "Pass";
          }
          
          // Recommended offer
          let adjustedCapRate = marketCapRate;
          if (sniperScore > 70) adjustedCapRate -= 0.5; // Premium for great deals
          else if (sniperScore < 40) adjustedCapRate += 1.0; // Discount for risky deals
          
          recommendedOffer = (noi / (adjustedCapRate/100)).toFixed(2);
        }
        break;
    }
    
    return {
      sniperScore,
      riskLevel,
      exitStrategy,
      recommendedOffer,
      propertyType: type
    };
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get current form data
    const currentFormData = formData[propertyType];
    
    // Calculate results
    const calculationResult = calculateScore(propertyType, currentFormData);
    
    // Set results
    setResult(calculationResult);
  };

  // Handle saving deal to localStorage and sync to CRM if enabled
  const saveDeal = async () => {
    // Reset status messages
    setSaveSuccess(false);
    setCrmSuccess(false);
    setCrmError(null);
    
    // Get existing saved deals from localStorage
    const existingDeals = localStorage.getItem('savedDeals') 
      ? JSON.parse(localStorage.getItem('savedDeals')) 
      : [];
    
    // Get current form data
    const currentFormData = formData[propertyType];
    
    // Create new deal object with timestamp
    const newDeal = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      propertyType,
      ...currentFormData,
      ...result,
    };
    
    // Add new deal to array
    const updatedDeals = [newDeal, ...existingDeals];
    
    // Save back to localStorage
    localStorage.setItem('savedDeals', JSON.stringify(updatedDeals));
    
    // Show success message
    setSaveSuccess(true);
    
    // Check if CRM sync is enabled
    if (accountData && 
        accountData.preferredCRM !== "None" && 
        accountData.crmAPIKey && 
        accountData.syncAutomatically) {
      
      try {
        // Sync deal to CRM
        const syncResult = await syncDealToCRM(newDeal, accountData);
        setCrmSuccess(true);
        
        // Clear CRM success message after 5 seconds
        setTimeout(() => {
          setCrmSuccess(false);
        }, 5000);
      } catch (error) {
        setCrmError(error.message || "Failed to sync with CRM");
        
        // Clear CRM error message after 5 seconds
        setTimeout(() => {
          setCrmError(null);
        }, 5000);
      }
    }
    
    // Clear save success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Render property form based on selected type
  const renderPropertyForm = () => {
    const currentFormData = formData[propertyType];
    
    switch (propertyType) {
      case PROPERTY_TYPES.LAND:
        return <LandForm data={currentFormData} onChange={handleChange} />;
      case PROPERTY_TYPES.RESIDENTIAL:
        return <ResidentialForm data={currentFormData} onChange={handleChange} />;
      case PROPERTY_TYPES.MULTI_FAMILY:
        return <MultiFamilyForm data={currentFormData} onChange={handleChange} />;
      case PROPERTY_TYPES.COMMERCIAL:
        return <CommercialForm data={currentFormData} onChange={handleChange} />;
      default:
        return <LandForm data={currentFormData} onChange={handleChange} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Head>
        <title>Analyze Deal - RE Hustle V2</title>
        <meta name="description" content="Analyze your real estate deal with our Sniper Score system" />
      </Head>
      
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-green-400">RE Hustle V2</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/dashboard" className="hover:text-green-400">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analyze-deal" className="text-green-400 font-bold">
                    Analyze Deal
                  </Link>
                </li>
                <li>
                  <Link href="/saved-deals" className="hover:text-green-400">
                    Saved Deals
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.email}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Analyze New Deal</h2>
          <div>
            <label className="mr-2">Property Type:</label>
            <select 
              value={propertyType} 
              onChange={(e) => setPropertyType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded p-2"
            >
              <option value={PROPERTY_TYPES.LAND}>{PROPERTY_TYPES.LAND}</option>
              <option value={PROPERTY_TYPES.RESIDENTIAL}>{PROPERTY_TYPES.RESIDENTIAL}</option>
              <option value={PROPERTY_TYPES.MULTI_FAMILY}>{PROPERTY_TYPES.MULTI_FAMILY}</option>
              <option value={PROPERTY_TYPES.COMMERCIAL}>{PROPERTY_TYPES.COMMERCIAL}</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Section - 3 columns */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="grid gap-4 bg-gray-800 p-6 rounded-lg shadow-lg">
              {renderPropertyForm()}
              
              <button 
                type="submit" 
                className="mt-2 bg-green-500 p-3 rounded text-white font-bold hover:bg-green-600 transition"
              >
                Calculate Sniper Score
              </button>
            </form>
          </div>
          
          {/* Results Section - 2 columns */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
                <h3 className="text-xl font-bold mb-4 text-green-400">Deal Analysis Results</h3>
                
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 ${
                      result.sniperScore > 70 ? 'border-green-500 text-green-400' :
                      result.sniperScore >= 40 ? 'border-yellow-500 text-yellow-400' :
                      'border-red-500 text-red-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{result.sniperScore}</div>
                        <div className="text-sm">Sniper Score</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="font-medium">Property Type:</span>
                      <span className="font-bold">{result.propertyType}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="font-medium">Risk Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.riskLevel === 'Green' ? 'bg-green-900/50 text-green-300 border border-green-600' : 
                        result.riskLevel === 'Yellow' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' : 'bg-red-900/50 text-red-300 border border-red-600'
                      }`}>{result.riskLevel}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="font-medium">Recommended Offer:</span>
                      <span className="font-bold">${parseFloat(result.recommendedOffer).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="font-medium">Exit Strategy:</span>
                      <span className="font-bold">{result.exitStrategy}</span>
                    </div>
                  </div>
                </div>
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-md text-green-400">
                    Deal saved successfully! View it in your <Link href="/saved-deals" className="underline">saved deals</Link>.
                  </div>
                )}
                
                {crmSuccess && (
                  <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-md text-blue-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deal synced to {accountData?.preferredCRM} successfully!
                  </div>
                )}
                
                {crmError && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    CRM sync error: {crmError}
                  </div>
                )}
                
                <div className="pt-4 flex items-center justify-between">
                  <Link href="/saved-deals" className="text-blue-400 hover:underline">
                    View All Saved Deals
                  </Link>
                  <button
                    onClick={saveDeal}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium"
                  >
                    Save Deal
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
                  <p>Fill out the form and click "Calculate Sniper Score" to see deal analysis results here.</p>
                </div>
                
                <div className="mt-6 w-full">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center bg-gray-700/30 rounded p-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3">1</div>
                      <span>Select property type</span>
                    </div>
                    <div className="flex items-center bg-gray-700/30 rounded p-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3">2</div>
                      <span>Enter property details</span>
                    </div>
                    <div className="flex items-center bg-gray-700/30 rounded p-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mr-3">3</div>
                      <span>Get your Sniper Score</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Add authentication protection to this page
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