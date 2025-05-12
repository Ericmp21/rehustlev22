/**
 * CRM Synchronization Utility
 * Handles sending deal data to various CRM platforms
 */

/**
 * Format and send deal data to the specified CRM
 * @param {Object} deal - The deal object with all property data
 * @param {Object} crmConfig - User's CRM configuration
 * @returns {Promise} - Result of the sync operation
 */
export async function syncDealToCRM(deal, crmConfig) {
  if (!crmConfig || crmConfig.preferredCRM === "None" || !crmConfig.crmAPIKey) {
    throw new Error("CRM not configured properly");
  }

  // Format the deal data for CRM consumption
  const formattedDeal = formatDealData(deal, crmConfig.preferredCRM);
  
  // Send to the appropriate CRM based on user preference
  try {
    switch (crmConfig.preferredCRM) {
      case "GoHighLevel":
        return await sendToGoHighLevel(formattedDeal, crmConfig.crmAPIKey);
      case "Podio":
        return await sendToPodio(formattedDeal, crmConfig.crmAPIKey);
      case "Notion":
        return await sendToNotion(formattedDeal, crmConfig.crmAPIKey);
      case "REI Reply":
        return await sendToREIReply(formattedDeal, crmConfig.crmAPIKey);
      default:
        throw new Error(`Unsupported CRM: ${crmConfig.preferredCRM}`);
    }
  } catch (error) {
    console.error(`Error syncing to ${crmConfig.preferredCRM}:`, error);
    throw error;
  }
}

/**
 * Format deal data appropriately for the specified CRM
 * @param {Object} deal - Raw deal data
 * @param {string} crmType - Type of CRM
 * @returns {Object} - Formatted deal data
 */
function formatDealData(deal, crmType) {
  // Common properties across all deal types
  const commonProperties = {
    dealId: deal.id,
    timestamp: deal.timestamp,
    sniperScore: deal.sniperScore,
    riskLevel: deal.riskLevel,
    recommendedOffer: deal.recommendedOffer,
    exitStrategy: deal.exitStrategy,
    propertyType: deal.propertyType || "Land",
    address: deal.address,
    notes: deal.additional_notes || deal.notes || ""
  };

  // Format based on property type and CRM requirements
  switch (crmType) {
    case "GoHighLevel":
      // GoHighLevel uses a flat structure with custom fields
      return {
        ...commonProperties,
        property_address: deal.address,
        deal_score: deal.sniperScore,
        risk_level: deal.riskLevel,
        recommended_offer: deal.recommendedOffer,
        exit_strategy: deal.exitStrategy,
        property_type: deal.propertyType || "Land",
        // Include property-specific data
        ...getPropertySpecificFields(deal)
      };
      
    case "Podio":
      // Podio uses a nested fields structure
      return {
        fields: {
          title: `${deal.propertyType || "Land"} Deal: ${deal.address || "Unnamed Property"}`,
          description: deal.notes || deal.additional_notes || "",
          sniper_score: {
            value: deal.sniperScore
          },
          property_details: {
            address: deal.address,
            property_type: deal.propertyType || "Land",
            risk_level: deal.riskLevel,
            exit_strategy: deal.exitStrategy
          },
          financial_details: {
            recommended_offer: deal.recommendedOffer,
            ...getFinancialDetails(deal)
          },
          property_attributes: getPropertySpecificFields(deal)
        }
      };
      
    case "Notion":
      // Notion uses a database properties structure
      return {
        parent: { database_id: "REPLACE_WITH_ACTUAL_DB_ID" },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `${deal.propertyType || "Land"} Deal: ${deal.address || "Unnamed Property"}`
                }
              }
            ]
          },
          Address: {
            rich_text: [
              {
                text: {
                  content: deal.address || "Unnamed Property"
                }
              }
            ]
          },
          "Property Type": {
            select: {
              name: deal.propertyType || "Land"
            }
          },
          "Sniper Score": {
            number: deal.sniperScore
          },
          "Risk Level": {
            select: {
              name: deal.riskLevel
            }
          },
          "Recommended Offer": {
            number: parseFloat(deal.recommendedOffer)
          },
          "Exit Strategy": {
            rich_text: [
              {
                text: {
                  content: deal.exitStrategy
                }
              }
            ]
          },
          "Analysis Date": {
            date: {
              start: new Date(deal.timestamp).toISOString()
            }
          },
          "Notes": {
            rich_text: [
              {
                text: {
                  content: deal.notes || deal.additional_notes || ""
                }
              }
            ]
          },
          ...getNotionPropertyFields(deal)
        }
      };
      
    case "REI Reply":
      // REI Reply accepts a simplified structure
      return {
        ...commonProperties,
        property: {
          address: deal.address,
          type: deal.propertyType || "Land",
          ...getPropertySpecificFields(deal)
        },
        analysis: {
          score: deal.sniperScore,
          risk_level: deal.riskLevel,
          recommended_offer: deal.recommendedOffer,
          exit_strategy: deal.exitStrategy
        },
        notes: deal.notes || deal.additional_notes || ""
      };
      
    default:
      // Default format
      return commonProperties;
  }
}

/**
 * Extract property-specific fields based on property type
 */
function getPropertySpecificFields(deal) {
  const propertyType = deal.propertyType || "Land";
  
  switch (propertyType) {
    case "Land":
      return {
        purchase_price: parseFloat(deal.purchase_price || deal.purchasePrice),
        market_value: parseFloat(deal.market_value || deal.marketValue),
        seller_motivation: deal.seller_motivation || deal.sellerMotivation,
        road_access: deal.road_access || deal.roadAccess,
        utilities: deal.utilities,
        environmental_risk: deal.environmental_risk,
        zoning_notes: deal.zoning_notes || deal.zoningNotes || ""
      };
      
    case "Residential":
      return {
        arv: parseFloat(deal.arv),
        repair_costs: parseFloat(deal.repair_costs),
        comps: deal.comps,
        distress_signals: deal.distress_signals,
        days_on_market: parseInt(deal.days_on_market) || 0,
        neighborhood_score: parseInt(deal.neighborhood_score) || 5
      };
      
    case "Multi-Family":
      return {
        unit_count: parseInt(deal.unit_count) || 0,
        monthly_rent_roll: parseFloat(deal.monthly_rent_roll) || 0,
        expenses: parseFloat(deal.expenses) || 0,
        cap_rate: parseFloat(deal.cap_rate) || 0,
        vacancy_rate: parseFloat(deal.vacancy_rate) || 0,
        stabilization_time: parseInt(deal.stabilization_time) || 0,
        purchase_price: parseFloat(deal.purchase_price) || 0
      };
      
    case "Commercial":
      return {
        noi: parseFloat(deal.noi) || 0,
        market_cap_rate: parseFloat(deal.market_cap_rate) || 0,
        vacancy_rate: parseFloat(deal.vacancy_rate) || 0,
        location_score: parseInt(deal.location_score) || 5,
        lease_terms: deal.lease_terms || "",
        purchase_price: parseFloat(deal.purchase_price) || 0
      };
      
    default:
      return {};
  }
}

/**
 * Get financial details formatted for Podio
 */
function getFinancialDetails(deal) {
  const propertyType = deal.propertyType || "Land";
  
  switch (propertyType) {
    case "Land":
      return {
        purchase_price: parseFloat(deal.purchase_price || deal.purchasePrice),
        market_value: parseFloat(deal.market_value || deal.marketValue)
      };
      
    case "Residential":
      return {
        arv: parseFloat(deal.arv),
        repair_costs: parseFloat(deal.repair_costs)
      };
      
    case "Multi-Family":
      return {
        monthly_rent_roll: parseFloat(deal.monthly_rent_roll) || 0,
        expenses: parseFloat(deal.expenses) || 0,
        cap_rate: parseFloat(deal.cap_rate) || 0,
        purchase_price: parseFloat(deal.purchase_price) || 0
      };
      
    case "Commercial":
      return {
        noi: parseFloat(deal.noi) || 0,
        market_cap_rate: parseFloat(deal.market_cap_rate) || 0,
        purchase_price: parseFloat(deal.purchase_price) || 0
      };
      
    default:
      return {};
  }
}

/**
 * Get property-specific fields formatted for Notion
 */
function getNotionPropertyFields(deal) {
  const propertyType = deal.propertyType || "Land";
  const fields = {};
  
  // Common fields across types with Notion-specific formatting
  switch (propertyType) {
    case "Land":
      fields["Purchase Price"] = { number: parseFloat(deal.purchase_price || deal.purchasePrice) };
      fields["Market Value"] = { number: parseFloat(deal.market_value || deal.marketValue) };
      if (deal.seller_motivation || deal.sellerMotivation) {
        fields["Seller Motivation"] = { 
          select: { name: deal.seller_motivation || deal.sellerMotivation } 
        };
      }
      if (deal.road_access || deal.roadAccess) {
        fields["Road Access"] = { 
          checkbox: (deal.road_access || deal.roadAccess) === "Yes" 
        };
      }
      if (deal.utilities) {
        fields["Utilities"] = { 
          checkbox: deal.utilities === "Yes" 
        };
      }
      break;
      
    case "Residential":
      fields["ARV"] = { number: parseFloat(deal.arv) };
      fields["Repair Costs"] = { number: parseFloat(deal.repair_costs) };
      fields["Days on Market"] = { number: parseInt(deal.days_on_market) || 0 };
      if (deal.neighborhood_score) {
        fields["Neighborhood Score"] = { number: parseInt(deal.neighborhood_score) };
      }
      if (deal.distress_signals) {
        fields["Distress Signals"] = { 
          select: { name: deal.distress_signals } 
        };
      }
      break;
      
    case "Multi-Family":
      fields["Unit Count"] = { number: parseInt(deal.unit_count) };
      fields["Monthly Rent"] = { number: parseFloat(deal.monthly_rent_roll) };
      fields["Monthly Expenses"] = { number: parseFloat(deal.expenses) };
      fields["Cap Rate"] = { number: parseFloat(deal.cap_rate) };
      fields["Vacancy Rate"] = { number: parseFloat(deal.vacancy_rate) };
      fields["Purchase Price"] = { number: parseFloat(deal.purchase_price) };
      break;
      
    case "Commercial":
      fields["NOI"] = { number: parseFloat(deal.noi) };
      fields["Cap Rate"] = { number: parseFloat(deal.market_cap_rate) };
      fields["Vacancy Rate"] = { number: parseFloat(deal.vacancy_rate) };
      fields["Purchase Price"] = { number: parseFloat(deal.purchase_price) };
      if (deal.lease_terms) {
        fields["Lease Terms"] = { 
          rich_text: [{ text: { content: deal.lease_terms } }] 
        };
      }
      break;
  }
  
  return fields;
}

/**
 * Send deal data to GoHighLevel via webhook
 */
async function sendToGoHighLevel(dealData, webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.status}`);
    }
    
    return {
      success: true,
      message: "Deal synced to GoHighLevel successfully",
      data: await response.json()
    };
  } catch (error) {
    console.error("GoHighLevel sync error:", error);
    throw error;
  }
}

/**
 * Send deal data to Podio via API
 */
async function sendToPodio(dealData, apiKey) {
  try {
    // In a real implementation, this would use the Podio SDK or API
    const response = await fetch('https://api.podio.com/item/app/{app_id}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      throw new Error(`Podio API error: ${response.status}`);
    }
    
    return {
      success: true,
      message: "Deal synced to Podio successfully",
      data: await response.json()
    };
  } catch (error) {
    console.error("Podio sync error:", error);
    throw error;
  }
}

/**
 * Send deal data to Notion via API
 */
async function sendToNotion(dealData, token) {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }
    
    return {
      success: true,
      message: "Deal synced to Notion successfully",
      data: await response.json()
    };
  } catch (error) {
    console.error("Notion sync error:", error);
    throw error;
  }
}

/**
 * Send deal data to REI Reply via API
 */
async function sendToREIReply(dealData, apiEndpoint) {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealData)
    });
    
    if (!response.ok) {
      throw new Error(`REI Reply API error: ${response.status}`);
    }
    
    return {
      success: true,
      message: "Deal synced to REI Reply successfully",
      data: await response.json()
    };
  } catch (error) {
    console.error("REI Reply sync error:", error);
    throw error;
  }
}