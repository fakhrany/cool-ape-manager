import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Plus, Edit2, Calendar, DollarSign, Archive, Target, Settings, Bell, Percent, HelpCircle, TrendingDown, Users, Clock } from 'lucide-react';

const CoolApeBusinessManager = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedMonth, setSelectedMonth] = useState('2024-11');
  const [showMonthlyInput, setShowMonthlyInput] = useState(false);
  const [showWeeklyUpdate, setShowWeeklyUpdate] = useState(false);
  const [showDiscountSimulator, setShowDiscountSimulator] = useState(false);
  
  const [drops, setDrops] = useState([
    {
      id: 1,
      name: 'Launch Collection',
      launchDate: '2024-01-01',
      status: 'active',
      products: [
        {
          id: 1,
          name: 'Cool Ape Hoodie - Black',
          sku: 'CAH-BLK-001',
          price: 2500,
          cogs: 800,
          initialStock: 100,
          monthlyData: {
            '2024-11': { sold: 15, returned: 2, soldWithDiscount: 3, discountPercent: 20, newCustomers: 12 },
            '2024-12': { sold: 12, returned: 1, soldWithDiscount: 2, discountPercent: 15, newCustomers: 10 }
          }
        }
      ]
    }
  ]);

  const [monthlyExpenses, setMonthlyExpenses] = useState({
    '2024-11': { adSpend: 30000, fixedCosts: 15000, shopifyFees: 2500, otherCosts: 5000 },
    '2024-12': { adSpend: 35000, fixedCosts: 15000, shopifyFees: 2500, otherCosts: 3000 }
  });

  const [discountScenario, setDiscountScenario] = useState({
    dropId: null,
    productIds: [],
    discountPercent: 30,
    expectedSalesIncrease: 50 // % increase in sales
  });

  const [weeklyData, setWeeklyData] = useState({
    week: new Date().toISOString().slice(0, 10),
    updates: []
  });

  const [showAddDrop, setShowAddDrop] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(null);

  const TooltipInfo = ({ title, formula, explanation, children }) => {
    const [show, setShow] = useState(false);
    
    return (
      <div className="relative inline-block">
        <div 
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {show && (
          <div className="absolute z-50 w-80 p-3 bg-gray-900 text-white rounded-lg shadow-2xl bottom-full left-1/2 transform -translate-x-1/2 mb-2 border-2 border-red-500">
            <div className="absolute w-3 h-3 bg-gray-900 border-r-2 border-b-2 border-red-500 transform rotate-45 -bottom-2 left-1/2 -translate-x-1/2"></div>
            <h4 className="font-black text-red-400 mb-1 text-xs">{title}</h4>
            {formula && <p className="text-xs font-bold text-gray-300 mb-1 font-mono bg-gray-800 p-1 rounded">{formula}</p>}
            <p className="text-xs leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const availableMonths = useMemo(() => {
    const months = [];
    const start = new Date('2024-01-01');
    const end = new Date();
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      months.push(d.toISOString().slice(0, 7));
    }
    return months.reverse();
  }, []);

  // COMPREHENSIVE BUSINESS ANALYSIS
  const businessAnalysis = useMemo(() => {
    let allMonthsData = [];
    let totalRevenue = 0, totalCOGS = 0, totalSoldUnits = 0, totalReturnedUnits = 0;
    let currentInventoryValue = 0, currentInventoryUnits = 0;
    let totalNewCustomers = 0, totalDiscountSales = 0, totalDiscountRevenue = 0;

    const allMonths = new Set([
      ...Object.keys(monthlyExpenses),
      ...drops.flatMap(drop => drop.products.flatMap(p => Object.keys(p.monthlyData || {})))
    ]);
    const sortedMonths = Array.from(allMonths).sort();

    sortedMonths.forEach(month => {
      let monthRevenue = 0, monthCOGS = 0, monthSold = 0, monthReturned = 0;
      let monthNewCustomers = 0, monthDiscountSales = 0;
      let monthAdSpend = monthlyExpenses[month]?.adSpend || 0;

      drops.forEach(drop => {
        drop.products.forEach(product => {
          const data = product.monthlyData?.[month];
          if (data) {
            const sold = data.sold || 0;
            const returned = data.returned || 0;
            const netSold = sold - returned;
            const discountSales = data.soldWithDiscount || 0;
            const discountPercent = data.discountPercent || 0;
            
            // Calculate revenue considering discounts
            const regularSales = netSold - discountSales;
            const regularRevenue = regularSales * product.price;
            const discountRevenue = discountSales * product.price * (1 - discountPercent/100);
            
            monthRevenue += regularRevenue + discountRevenue;
            monthCOGS += netSold * product.cogs;
            monthSold += sold;
            monthReturned += returned;
            monthNewCustomers += data.newCustomers || 0;
            monthDiscountSales += discountSales;
            
            if (discountSales > 0) {
              totalDiscountRevenue += discountRevenue;
            }
          }
        });
      });

      const monthExpenses = monthlyExpenses[month];
      const totalMonthExpenses = (monthExpenses?.adSpend || 0) + 
                                  (monthExpenses?.fixedCosts || 0) + 
                                  (monthExpenses?.shopifyFees || 0) + 
                                  (monthExpenses?.otherCosts || 0);

      const monthProfit = monthRevenue - monthCOGS - totalMonthExpenses;
      const monthROAS = monthAdSpend > 0 ? monthRevenue / monthAdSpend : 0;
      const monthCAC = monthNewCustomers > 0 ? monthAdSpend / monthNewCustomers : 0;

      allMonthsData.push({
        month: new Date(month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        monthKey: month,
        revenue: monthRevenue,
        cogs: monthCOGS,
        expenses: totalMonthExpenses,
        profit: monthProfit,
        sold: monthSold,
        returned: monthReturned,
        adSpend: monthAdSpend,
        roas: monthROAS,
        cac: monthCAC,
        newCustomers: monthNewCustomers,
        discountSales: monthDiscountSales
      });

      totalRevenue += monthRevenue;
      totalCOGS += monthCOGS;
      totalSoldUnits += monthSold;
      totalReturnedUnits += monthReturned;
      totalNewCustomers += monthNewCustomers;
      totalDiscountSales += monthDiscountSales;
    });

    // Calculate current inventory & generate alerts
    const restockAlerts = [];
    drops.forEach(drop => {
      drop.products.forEach(product => {
        const totalSold = Object.values(product.monthlyData || {}).reduce((sum, data) => 
          sum + (data.sold || 0) - (data.returned || 0), 0);
        
        const remaining = product.initialStock - totalSold;
        const remainingPercent = (remaining / product.initialStock) * 100;
        
        // RESTOCK ALERT: 25% or less remaining
        if (remainingPercent <= 25 && remainingPercent > 0) {
          restockAlerts.push({
            dropName: drop.name,
            productName: product.name,
            remaining,
            remainingPercent: remainingPercent.toFixed(0),
            initialStock: product.initialStock
          });
        }
        
        currentInventoryUnits += remaining;
        currentInventoryValue += remaining * product.cogs;
      });
    });

    // Calculate drop performance
    const dropPerformance = drops.map(drop => {
      let dropRevenue = 0, dropCOGS = 0, dropSoldUnits = 0;
      let dropProducts = [];

      drop.products.forEach(product => {
        let productTotalSold = 0, productTotalReturned = 0, productRevenue = 0;
        let productDiscountSales = 0;

        Object.values(product.monthlyData || {}).forEach(data => {
          productTotalSold += data.sold || 0;
          productTotalReturned += data.returned || 0;
          productDiscountSales += data.soldWithDiscount || 0;
        });

        const netSold = productTotalSold - productTotalReturned;
        productRevenue = netSold * product.price;
        const productCOGS = netSold * product.cogs;
        const remaining = product.initialStock - netSold;
        const inventoryValue = remaining * product.cogs;
        const remainingPercent = (remaining / product.initialStock) * 100;

        const monthsSinceLaunch = Math.max(Object.keys(product.monthlyData || {}).length, 1);
        const avgMonthlySales = netSold / monthsSinceLaunch;
        const monthsOfStockRemaining = avgMonthlySales > 0 ? remaining / avgMonthlySales : 999;
        const isDead = monthsOfStockRemaining > 6 && remaining > 10;

        dropRevenue += productRevenue;
        dropCOGS += productCOGS;
        dropSoldUnits += netSold;

        dropProducts.push({
          ...product,
          totalSold: productTotalSold,
          totalReturned: productTotalReturned,
          netSold,
          remaining,
          remainingPercent: remainingPercent.toFixed(1),
          revenue: productRevenue,
          profit: productRevenue - productCOGS,
          inventoryValue,
          sellThrough: (netSold / product.initialStock * 100).toFixed(1),
          returnRate: productTotalSold > 0 ? (productTotalReturned / productTotalSold * 100).toFixed(1) : 0,
          discountSales: productDiscountSales,
          isDead,
          monthsOfStockRemaining: monthsOfStockRemaining.toFixed(1),
          needsRestock: remainingPercent <= 25 && remainingPercent > 0
        });
      });

      return {
        dropId: drop.id,
        dropName: drop.name,
        revenue: dropRevenue,
        cogs: dropCOGS,
        profit: dropRevenue - dropCOGS,
        soldUnits: dropSoldUnits,
        products: dropProducts
      };
    });

    const totalExpenses = Object.values(monthlyExpenses).reduce((sum, exp) => 
      sum + (exp.adSpend || 0) + (exp.fixedCosts || 0) + (exp.shopifyFees || 0) + (exp.otherCosts || 0), 0);
    
    const netProfit = totalRevenue - totalCOGS - totalExpenses;
    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
    const totalAdSpend = Object.values(monthlyExpenses).reduce((sum, exp) => sum + (exp.adSpend || 0), 0);
    const overallROAS = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
    const overallCAC = totalNewCustomers > 0 ? totalAdSpend / totalNewCustomers : 0;
    const returnRate = totalSoldUnits > 0 ? (totalReturnedUnits / totalSoldUnits * 100) : 0;
    const avgOrderValue = totalSoldUnits > 0 ? totalRevenue / totalSoldUnits : 0;
    const discountSalesPercent = totalSoldUnits > 0 ? (totalDiscountSales / totalSoldUnits * 100) : 0;

    // PROJECTIONS - "If you continue this way"
    const projections = [];
    if (allMonthsData.length >= 2) {
      const recentMonths = allMonthsData.slice(-3);
      const avgMonthlyRevenue = recentMonths.reduce((sum, m) => sum + m.revenue, 0) / recentMonths.length;
      const avgMonthlyProfit = recentMonths.reduce((sum, m) => sum + m.profit, 0) / recentMonths.length;
      const avgMonthlyExpenses = recentMonths.reduce((sum, m) => sum + m.expenses, 0) / recentMonths.length;
      const avgGrowthRate = recentMonths.length >= 2 ? 
        ((recentMonths[recentMonths.length-1].revenue - recentMonths[0].revenue) / recentMonths[0].revenue / (recentMonths.length-1)) : 0.05;

      for (let i = 1; i <= 6; i++) {
        const projectedRevenue = avgMonthlyRevenue * Math.pow(1 + avgGrowthRate, i);
        const projectedExpenses = avgMonthlyExpenses * Math.pow(1.03, i); // Assume 3% expense growth
        const projectedProfit = projectedRevenue - projectedExpenses - (projectedRevenue * 0.35); // Assume 35% COGS
        
        projections.push({
          month: `+${i}M`,
          revenue: projectedRevenue,
          expenses: projectedExpenses,
          profit: projectedProfit
        });
      }
    }

    let deadStockValue = 0;
    dropPerformance.forEach(drop => {
      drop.products.forEach(p => {
        if (p.isDead) deadStockValue += p.inventoryValue;
      });
    });

    return {
      totalRevenue, totalCOGS, grossProfit, grossMargin, netProfit, netMargin,
      totalSoldUnits, totalReturnedUnits, returnRate, currentInventoryUnits, currentInventoryValue,
      deadStockValue, overallROAS, overallCAC, totalNewCustomers, avgOrderValue,
      totalAdSpend, totalExpenses, discountSalesPercent, totalDiscountRevenue,
      monthlyData: allMonthsData, dropPerformance, projections, restockAlerts
    };
  }, [drops, monthlyExpenses]);

  // DISCOUNT IMPACT SIMULATOR
  const discountImpact = useMemo(() => {
    if (!discountScenario.dropId || !discountScenario.discountPercent) return null;

    const drop = drops.find(d => d.id === discountScenario.dropId);
    if (!drop) return null;

    const targetProducts = discountScenario.productIds.length > 0 
      ? drop.products.filter(p => discountScenario.productIds.includes(p.id))
      : drop.products;

    let currentInventoryValue = 0, projectedRevenue = 0, projectedProfit = 0;
    let unitsToSell = 0;

    targetProducts.forEach(product => {
      const totalSold = Object.values(product.monthlyData || {}).reduce((sum, data) => 
        sum + (data.sold || 0) - (data.returned || 0), 0);
      const remaining = product.initialStock - totalSold;
      
      currentInventoryValue += remaining * product.cogs;
      
      // Estimate sales increase based on discount
      const estimatedSales = Math.min(remaining, remaining * (discountScenario.expectedSalesIncrease / 100));
      const discountedPrice = product.price * (1 - discountScenario.discountPercent / 100);
      const revenue = estimatedSales * discountedPrice;
      const cost = estimatedSales * product.cogs;
      
      projectedRevenue += revenue;
      projectedProfit += revenue - cost;
      unitsToSell += estimatedSales;
    });

    const breakEvenDiscount = targetProducts.length > 0 
      ? (1 - targetProducts[0].cogs / targetProducts[0].price) * 100 
      : 0;

    return {
      currentInventoryValue,
      projectedRevenue,
      projectedProfit,
      unitsToSell: Math.round(unitsToSell),
      cashFreed: currentInventoryValue,
      breakEvenDiscount: breakEvenDiscount.toFixed(1),
      isProfitable: projectedProfit > 0
    };
  }, [discountScenario, drops]);

  // ENHANCED RECOMMENDATIONS
  const recommendations = useMemo(() => {
    const recs = [];
    
    // RESTOCK ALERTS (Priority #1)
    businessAnalysis.restockAlerts.forEach(alert => {
      recs.push({
        priority: 'critical',
        title: `🚨 RESTOCK: ${alert.productName}`,
        description: `Only ${alert.remaining} units left (${alert.remainingPercent}% of stock)`,
        action: `Order ${Math.ceil(alert.initialStock * 0.5)} units immediately`,
        impact: `Avoid stockout & lost sales`
      });
    });

    // High CAC
    if (businessAnalysis.overallCAC > 150) {
      recs.push({
        priority: 'high',
        title: `High Customer Acquisition Cost: ${businessAnalysis.overallCAC.toFixed(0)} EGP`,
        description: `You're spending too much to acquire each customer`,
        action: 'Optimize ad targeting, test new creatives, improve organic reach',
        impact: `Save ${(businessAnalysis.totalAdSpend * 0.2).toFixed(0)} EGP monthly`
      });
    }

    // High return rate
    if (businessAnalysis.returnRate > 15) {
      recs.push({
        priority: 'high',
        title: `High Return Rate: ${businessAnalysis.returnRate.toFixed(1)}%`,
        description: `${businessAnalysis.totalReturnedUnits} units returned`,
        action: 'Review sizing, quality, and product descriptions',
        impact: `Save ${(businessAnalysis.totalReturnedUnits * 800).toFixed(0)} EGP in losses`
      });
    }

    // Dead stock
    businessAnalysis.dropPerformance.forEach(drop => {
      drop.products.forEach(product => {
        if (product.isDead && product.remaining > 10) {
          recs.push({
            priority: 'high',
            title: `Dead Stock: ${product.name}`,
            description: `${product.remaining} units for ${product.monthsOfStockRemaining}+ months`,
            action: `Discount 40-50% to liquidate`,
            impact: `Free ${product.inventoryValue.toFixed(0)} EGP cash`
          });
        }
      });
    });

    // Low profit margin
    if (businessAnalysis.netMargin < 10 && businessAnalysis.totalRevenue > 0) {
      recs.push({
        priority: 'high',
        title: `Low Net Profit Margin: ${businessAnalysis.netMargin.toFixed(1)}%`,
        description: 'Target: 15-25% for healthy business',
        action: 'Increase prices 10-15%, negotiate better COGS, reduce expenses',
        impact: `Boost profit by ${(businessAnalysis.totalRevenue * 0.15).toFixed(0)} EGP`
      });
    }

    // Low ROAS
    if (businessAnalysis.overallROAS < 2.5 && businessAnalysis.totalAdSpend > 0) {
      recs.push({
        priority: 'medium',
        title: `Low Ad Performance: ${businessAnalysis.overallROAS.toFixed(2)}x ROAS`,
        description: 'Target: 2.5x+ for sustainable growth',
        action: 'Test new ad formats, refine audience, improve landing page',
        impact: 'Better ad efficiency & lower CAC'
      });
    }

    // Too many discount sales
    if (businessAnalysis.discountSalesPercent > 40) {
      recs.push({
        priority: 'medium',
        title: `Heavy Discounting: ${businessAnalysis.discountSalesPercent.toFixed(0)}% of sales`,
        description: 'Too many sales at discount hurts margins',
        action: 'Reduce discount frequency, increase perceived value',
        impact: 'Improve margins by 10-15%'
      });
    }

    return recs.sort((a, b) => 
      ({ critical: 0, high: 1, medium: 2 }[a.priority] - { critical: 0, high: 1, medium: 2 }[b.priority])
    );
  }, [businessAnalysis]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
        input:focus, select:focus { outline: none; box-shadow: 0 0 0 2px rgba(227, 30, 36, 0.2); border-color: #E31E24; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header with Alerts */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Cool Ape Business Manager</h1>
            {businessAnalysis.restockAlerts.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Bell size={16} className="text-red-600 animate-pulse" />
                <span className="text-xs font-bold text-red-600">
                  {businessAnalysis.restockAlerts.length} product(s) need restocking!
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowWeeklyUpdate(true)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 text-xs">
              <Clock size={14} /> Weekly Update
            </button>
            <button onClick={() => setShowMonthlyInput(true)} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 text-xs">
              <Calendar size={14} /> Monthly Data
            </button>
          </div>
        </div>

        {/* Weekly Update Modal */}
        {showWeeklyUpdate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 max-w-2xl w-full shadow-2xl">
              <h2 className="text-xl font-black text-gray-900 mb-3">📅 Weekly Check-In</h2>
              <p className="text-sm text-gray-700 font-semibold mb-3">Update this week's performance</p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {drops.map(drop => (
                  <div key={drop.id} className="border-2 border-gray-200 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{drop.name}</h3>
                    {drop.products.map(product => (
                      <div key={product.id} className="bg-gray-50 rounded p-2 mb-2">
                        <p className="text-xs font-bold text-gray-800 mb-2">{product.name}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Units Sold</label>
                            <input type="number" placeholder="0" className="w-full px-2 py-1 border-2 border-gray-300 rounded text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">With Discount?</label>
                            <input type="number" placeholder="0" className="w-full px-2 py-1 border-2 border-gray-300 rounded text-xs font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Returns</label>
                            <input type="number" placeholder="0" className="w-full px-2 py-1 border-2 border-gray-300 rounded text-xs font-semibold" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm">
                  ✓ Save Week
                </button>
                <button onClick={() => setShowWeeklyUpdate(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Input Modal (same as before but with CAC tracking) */}
        {showMonthlyInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-black text-gray-900 mb-3">📊 Monthly Data Input</h2>

              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm">
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-3 border-2 border-blue-200">
                <h3 className="text-base font-black text-gray-900 mb-2">💰 Expenses - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long' })}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ad Spend (EGP)</label>
                    <input type="number" value={monthlyExpenses[selectedMonth]?.adSpend || 0}
                      onChange={(e) => setMonthlyExpenses({ ...monthlyExpenses, [selectedMonth]: { ...monthlyExpenses[selectedMonth], adSpend: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fixed Costs (EGP)</label>
                    <input type="number" value={monthlyExpenses[selectedMonth]?.fixedCosts || 0}
                      onChange={(e) => setMonthlyExpenses({ ...monthlyExpenses, [selectedMonth]: { ...monthlyExpenses[selectedMonth], fixedCosts: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Shopify (EGP)</label>
                    <input type="number" value={monthlyExpenses[selectedMonth]?.shopifyFees || 0}
                      onChange={(e) => setMonthlyExpenses({ ...monthlyExpenses, [selectedMonth]: { ...monthlyExpenses[selectedMonth], shopifyFees: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Other (EGP)</label>
                    <input type="number" value={monthlyExpenses[selectedMonth]?.otherCosts || 0}
                      onChange={(e) => setMonthlyExpenses({ ...monthlyExpenses, [selectedMonth]: { ...monthlyExpenses[selectedMonth], otherCosts: parseFloat(e.target.value) || 0 }})}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                <h3 className="text-base font-black text-gray-900 mb-2">📦 Sales - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long' })}</h3>
                {drops.map(drop => (
                  <div key={drop.id} className="mb-3">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">{drop.name}</h4>
                    {drop.products.map(product => (
                      <div key={product.id} className="bg-white rounded-lg p-2 border border-gray-200 mb-2">
                        <p className="text-sm font-bold text-gray-900 mb-2">{product.name}</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Sold</label>
                            <input type="number" value={product.monthlyData?.[selectedMonth]?.sold || 0}
                              onChange={(e) => {
                                setDrops(drops.map(d => d.id === drop.id ? {
                                  ...d, products: d.products.map(p => p.id === product.id ? {
                                    ...p, monthlyData: { ...p.monthlyData, [selectedMonth]: { ...p.monthlyData?.[selectedMonth], sold: parseInt(e.target.value) || 0 }}
                                  } : p)
                                } : d));
                              }}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Returned</label>
                            <input type="number" value={product.monthlyData?.[selectedMonth]?.returned || 0}
                              onChange={(e) => {
                                setDrops(drops.map(d => d.id === drop.id ? {
                                  ...d, products: d.products.map(p => p.id === product.id ? {
                                    ...p, monthlyData: { ...p.monthlyData, [selectedMonth]: { ...p.monthlyData?.[selectedMonth], returned: parseInt(e.target.value) || 0 }}
                                  } : p)
                                } : d));
                              }}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">With Discount</label>
                            <input type="number" value={product.monthlyData?.[selectedMonth]?.soldWithDiscount || 0}
                              onChange={(e) => {
                                setDrops(drops.map(d => d.id === drop.id ? {
                                  ...d, products: d.products.map(p => p.id === product.id ? {
                                    ...p, monthlyData: { ...p.monthlyData, [selectedMonth]: { ...p.monthlyData?.[selectedMonth], soldWithDiscount: parseInt(e.target.value) || 0 }}
                                  } : p)
                                } : d));
                              }}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Discount %</label>
                            <input type="number" value={product.monthlyData?.[selectedMonth]?.discountPercent || 0}
                              onChange={(e) => {
                                setDrops(drops.map(d => d.id === drop.id ? {
                                  ...d, products: d.products.map(p => p.id === product.id ? {
                                    ...p, monthlyData: { ...p.monthlyData, [selectedMonth]: { ...p.monthlyData?.[selectedMonth], discountPercent: parseInt(e.target.value) || 0 }}
                                  } : p)
                                } : d));
                              }}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">New Customers</label>
                            <input type="number" value={product.monthlyData?.[selectedMonth]?.newCustomers || 0}
                              onChange={(e) => {
                                setDrops(drops.map(d => d.id === drop.id ? {
                                  ...d, products: d.products.map(p => p.id === product.id ? {
                                    ...p, monthlyData: { ...p.monthlyData, [selectedMonth]: { ...p.monthlyData?.[selectedMonth], newCustomers: parseInt(e.target.value) || 0 }}
                                  } : p)
                                } : d));
                              }}
                              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm font-semibold" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button onClick={() => setShowMonthlyInput(false)} className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700">
                ✓ Save All Data
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md p-1 mb-3 flex gap-1 overflow-x-auto">
          {[
            { id: 'setup', label: 'Setup', icon: Settings },
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'drops', label: 'Drops', icon: Package },
            { id: 'inventory', label: 'Inventory', icon: Archive },
            { id: 'analytics', label: 'Analytics', icon: Target },
            { id: 'discounts', label: 'Discounts', icon: Percent },
            { id: 'recommendations', label: 'Tips', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-all text-xs ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-4 text-white shadow-md">
              <h2 className="text-xl font-black mb-1">Welcome! 🎉</h2>
              <p className="text-sm font-semibold">Track everything: sales, returns, discounts, CAC, and get smart recommendations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-2">1. Create Drops & Products</h3>
                <p className="text-xs text-gray-700 font-semibold mb-2">Add your collections and products</p>
                <button onClick={() => setActiveTab('drops')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 text-xs">
                  Go to Drops
                </button>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-2">2. Monthly Data Entry</h3>
                <p className="text-xs text-gray-700 font-semibold mb-2">Input sales, returns, expenses, CAC</p>
                <button onClick={() => setShowMonthlyInput(true)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 text-xs">
                  Update Monthly
                </button>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-2">3. Weekly Check-Ins</h3>
                <p className="text-xs text-gray-700 font-semibold mb-2">Quick updates on sales & discounts</p>
                <button onClick={() => setShowWeeklyUpdate(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 text-xs">
                  Weekly Update
                </button>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-md">
                <h3 className="text-base font-black text-gray-900 mb-2">4. View Analytics</h3>
                <p className="text-xs text-gray-700 font-semibold mb-2">See trends, projections, recommendations</p>
                <button onClick={() => setActiveTab('analytics')} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-purple-700 text-xs">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB - with tooltips */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <TooltipInfo 
                title="Total Revenue" 
                formula="Sum of all sales (accounting for discounts)"
                explanation="This is your top-line number. It includes all product sales at both full price and discounted prices. Higher revenue is good, but watch your profit margin."
              >
                <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-green-600">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Revenue</h3>
                  <p className="text-xl font-black text-gray-900">{(businessAnalysis.totalRevenue/1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600 font-semibold">{businessAnalysis.totalSoldUnits} units</p>
                </div>
              </TooltipInfo>

              <TooltipInfo 
                title="Net Profit"
                formula="Revenue - COGS - All Expenses"
                explanation="Your actual bottom-line profit after ALL costs (products, ads, fixed costs, Shopify, etc.). This is what you can reinvest or take home. Aim for 15-25% net margin."
              >
                <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-red-600">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Net Profit</h3>
                  <p className="text-xl font-black text-gray-900">{(businessAnalysis.netProfit/1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600 font-semibold">{businessAnalysis.netMargin.toFixed(1)}%</p>
                </div>
              </TooltipInfo>

              <TooltipInfo 
                title="Customer Acquisition Cost (CAC)"
                formula="Total Ad Spend / New Customers"
                explanation="How much you spend in ads to get one new customer. Lower is better. Compare this to your average order value - ideally CAC should be 30-40% of AOV or less."
              >
                <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-purple-600">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">CAC</h3>
                  <p className="text-xl font-black text-gray-900">{businessAnalysis.overallCAC.toFixed(0)}</p>
                  <p className="text-xs text-gray-600 font-semibold">{businessAnalysis.totalNewCustomers} customers</p>
                </div>
              </TooltipInfo>

              <TooltipInfo 
                title="Inventory Value"
                formula="Remaining Units × COGS"
                explanation="Total cash tied up in unsold inventory. This is money you've spent but haven't recovered yet. Lower inventory turnover means more cash is locked up."
              >
                <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-blue-600">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Inventory</h3>
                  <p className="text-xl font-black text-gray-900">{(businessAnalysis.currentInventoryValue/1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600 font-semibold">{businessAnalysis.currentInventoryUnits} units</p>
                </div>
              </TooltipInfo>

              <TooltipInfo 
                title="Return Rate"
                formula="(Returned Units / Sold Units) × 100"
                explanation="Percentage of orders that get returned. Fashion brands typically see 5-15%. High returns hurt profitability and may indicate sizing, quality, or expectation issues."
              >
                <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-orange-600">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Returns</h3>
                  <p className="text-xl font-black text-gray-900">{businessAnalysis.totalReturnedUnits}</p>
                  <p className="text-xs text-gray-600 font-semibold">{businessAnalysis.returnRate.toFixed(1)}%</p>
                </div>
              </TooltipInfo>
            </div>

            {/* Monthly Performance with tooltips */}
            <div className="bg-white rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-black text-gray-900">Monthly Performance</h2>
                <TooltipInfo
                  title="Monthly Trends"
                  explanation="This chart shows your revenue and profit over time. Look for upward trends (growth) or downward trends (problems). Consistent growth is the goal!"
                >
                  <HelpCircle size={16} className="text-gray-400 cursor-help" />
                </TooltipInfo>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={businessAnalysis.monthlyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E31E24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E31E24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #E31E24' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#E31E24" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 6-Month Projection */}
            {businessAnalysis.projections.length > 0 && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-black">📊 6-Month Projection: "If You Continue This Way"</h3>
                  <TooltipInfo
                    title="Future Projection"
                    explanation="Based on your recent performance trend, this shows where you'll be in 6 months if you maintain the same growth rate and expense levels. Use this to plan inventory, hiring, and investments."
                  >
                    <HelpCircle size={16} className="text-white cursor-help" />
                  </TooltipInfo>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={businessAnalysis.projections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="month" stroke="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <YAxis stroke="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#1f2937', border: 'none', borderRadius: '6px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Projected Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#fbbf24" strokeWidth={2} name="Projected Profit" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2 opacity-90">
                  In 6 months: ~{(businessAnalysis.projections[5]?.revenue/1000).toFixed(0)}K EGP revenue, ~{(businessAnalysis.projections[5]?.profit/1000).toFixed(0)}K EGP profit
                </p>
              </div>
            )}
          </div>
        )}

        {/* DROPS TAB - (keep existing but add restock indicators) */}
        {activeTab === 'drops' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Your Drops</h2>
              <button onClick={() => setShowAddDrop(true)} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 text-xs">
                <Plus size={14} /> New Drop
              </button>
            </div>

            {drops.map(drop => (
              <div key={drop.id} className="bg-white rounded-lg p-3 shadow-md border-l-4 border-red-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-black text-gray-900">{drop.name}</h3>
                    <p className="text-xs text-gray-600 font-semibold">{new Date(drop.launchDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setShowAddProduct(drop.id)} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-blue-700 text-xs">
                    <Plus size={12} /> Product
                  </button>
                </div>

                {drop.products.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left p-1.5 font-black text-gray-700 text-xs">Product</th>
                          <th className="text-right p-1.5 font-black text-gray-700 text-xs">Price</th>
                          <th className="text-right p-1.5 font-black text-gray-700 text-xs">Sold</th>
                          <th className="text-right p-1.5 font-black text-gray-700 text-xs">Stock</th>
                          <th className="text-right p-1.5 font-black text-gray-700 text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businessAnalysis.dropPerformance.find(d => d.dropId === drop.id)?.products.map(product => (
                          <tr key={product.id} className={`border-b border-gray-100 ${product.needsRestock ? 'bg-red-50' : ''}`}>
                            <td className="p-1.5">
                              <p className="font-bold text-gray-900 text-xs flex items-center gap-1">
                                {product.name}
                                {product.needsRestock && <Bell size={12} className="text-red-600 animate-pulse" />}
                              </p>
                            </td>
                            <td className="text-right p-1.5 font-bold text-gray-700">{product.price}</td>
                            <td className="text-right p-1.5 font-bold text-green-600">{product.totalSold}</td>
                            <td className="text-right p-1.5 font-bold text-blue-600">{product.remaining}</td>
                            <td className="text-right p-1.5">
                              {product.needsRestock ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700">
                                  RESTOCK!
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-100 text-green-700">
                                  {product.sellThrough}%
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Add Drop/Product Modals (same as before) */}
            {showAddDrop && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4 shadow-2xl">
                  <h3 className="text-lg font-black text-gray-900 mb-3">New Drop</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                      <input type="text" id="dropName" placeholder="Summer 2024" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                      <input type="date" id="dropDate" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => {
                        const name = document.getElementById('dropName').value;
                        const date = document.getElementById('dropDate').value;
                        if (name && date) {
                          setDrops([...drops, { id: Date.now(), name, launchDate: date, status: 'active', products: [] }]);
                          setShowAddDrop(false);
                        }
                      }} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-red-700 text-sm">
                        Create
                      </button>
                      <button onClick={() => setShowAddDrop(false)} className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-bold hover:bg-gray-300 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showAddProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 shadow-2xl">
                  <h3 className="text-lg font-black text-gray-900 mb-3">Add Product</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                      <input type="text" id="prodName" placeholder="Cool Ape Hoodie" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">SKU</label>
                      <input type="text" id="prodSKU" placeholder="CAH-001" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Initial Stock</label>
                      <input type="number" id="prodStock" placeholder="100" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price (EGP)</label>
                      <input type="number" id="prodPrice" placeholder="2500" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">COGS (EGP)</label>
                      <input type="number" id="prodCOGS" placeholder="800" className="w-full px-2 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm" />
                    </div>
                    <div className="col-span-2 flex gap-2 mt-2">
                      <button onClick={() => {
                        const name = document.getElementById('prodName').value;
                        const sku = document.getElementById('prodSKU').value;
                        const price = parseFloat(document.getElementById('prodPrice').value);
                        const cogs = parseFloat(document.getElementById('prodCOGS').value);
                        const stock = parseInt(document.getElementById('prodStock').value);
                        if (name && sku && price && cogs && stock) {
                          setDrops(drops.map(d => d.id === showAddProduct ? {
                            ...d, products: [...d.products, { id: Date.now(), name, sku, price, cogs, initialStock: stock, monthlyData: {} }]
                          } : d));
                          setShowAddProduct(null);
                        }
                      }} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-red-700 text-sm">
                        Add
                      </button>
                      <button onClick={() => setShowAddProduct(null)} className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-bold hover:bg-gray-300 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB - same as before */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-gray-900">Current Inventory</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-blue-600">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Value</h3>
                <p className="text-xl font-black text-blue-600">{(businessAnalysis.currentInventoryValue/1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-green-600">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Units</h3>
                <p className="text-xl font-black text-green-600">{businessAnalysis.currentInventoryUnits}</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-orange-600">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Dead Stock</h3>
                <p className="text-xl font-black text-orange-600">{(businessAnalysis.deadStockValue/1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border-l-4 border-red-600">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-0.5">Return Rate</h3>
                <p className="text-xl font-black text-red-600">{businessAnalysis.returnRate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-md">
              <h3 className="text-base font-black text-gray-900 mb-2">All Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-1.5 font-black text-gray-700 text-xs">Product</th>
                      <th className="text-right p-1.5 font-black text-gray-700 text-xs">Stock</th>
                      <th className="text-right p-1.5 font-black text-gray-700 text-xs">% Left</th>
                      <th className="text-right p-1.5 font-black text-gray-700 text-xs">Value</th>
                      <th className="text-center p-1.5 font-black text-gray-700 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessAnalysis.dropPerformance.flatMap(drop => 
                      drop.products.map(product => (
                        <tr key={`${drop.dropId}-${product.id}`} className={`border-b border-gray-100 ${product.needsRestock ? 'bg-red-50' : ''}`}>
                          <td className="p-1.5 font-bold text-gray-900 text-xs">
                            {product.name}
                            {product.needsRestock && <Bell size={10} className="inline ml-1 text-red-600" />}
                          </td>
                          <td className="text-right p-1.5 font-bold text-blue-600">{product.remaining}</td>
                          <td className="text-right p-1.5 font-bold text-purple-600">{product.remainingPercent}%</td>
                          <td className="text-right p-1.5 font-bold text-gray-700">{(product.inventoryValue/1000).toFixed(1)}K</td>
                          <td className="text-center p-1.5">
                            {product.needsRestock ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">RESTOCK</span>
                            ) : product.isDead ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Dead</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Good</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB - Enhanced with tooltips */}
        {activeTab === 'analytics' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-gray-900">Business Analytics</h2>

            <div className="bg-white rounded-lg p-3 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-black text-gray-900">Revenue, Profit & Expenses</h3>
                <TooltipInfo
                  title="Performance Trend"
                  explanation="Green = Revenue (money coming in), Red = Profit (what you keep), Orange = Expenses (what you spend). Watch for profit growing faster than expenses."
                >
                  <HelpCircle size={14} className="text-gray-400 cursor-help" />
                </TooltipInfo>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={businessAnalysis.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold', borderRadius: '6px', border: '2px solid #E31E24' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#E31E24" strokeWidth={2} name="Profit" />
                  <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-black text-gray-900">CAC Trend</h3>
                  <TooltipInfo
                    title="Customer Acquisition Cost"
                    explanation="Lower is better. If CAC is increasing, your ads are getting less efficient. If it's decreasing, you're acquiring customers more cheaply."
                  >
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                  </TooltipInfo>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={businessAnalysis.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="cac" fill="#8b5cf6" name="CAC (EGP)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-black text-gray-900">ROAS by Month</h3>
                  <TooltipInfo
                    title="Return on Ad Spend"
                    explanation="For every 1 EGP spent on ads, how many EGP revenue you generate. Target: 2.5x+. Below 2x means ads aren't profitable."
                  >
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                  </TooltipInfo>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={businessAnalysis.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="roas" fill="#3b82f6" name="ROAS" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* DISCOUNT SIMULATOR TAB */}
        {activeTab === 'discounts' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-gray-900">Discount Impact Simulator</h2>
            
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-base font-black text-gray-900 mb-3">Test Discount Scenarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Drop</label>
                  <select 
                    value={discountScenario.dropId || ''}
                    onChange={(e) => setDiscountScenario({...discountScenario, dropId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm"
                  >
                    <option value="">Choose...</option>
                    {drops.map(drop => <option key={drop.id} value={drop.id}>{drop.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                  <input 
                    type="number" 
                    value={discountScenario.discountPercent}
                    onChange={(e) => setDiscountScenario({...discountScenario, discountPercent: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sales Increase %</label>
                  <input 
                    type="number" 
                    value={discountScenario.expectedSalesIncrease}
                    onChange={(e) => setDiscountScenario({...discountScenario, expectedSalesIncrease: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm"
                  />
                </div>
              </div>

              {discountImpact && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Units to Sell</p>
                    <p className="text-2xl font-black text-blue-600">{discountImpact.unitsToSell}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Revenue</p>
                    <p className="text-2xl font-black text-green-600">{(discountImpact.projectedRevenue/1000).toFixed(0)}K</p>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${discountImpact.isProfitable ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Profit</p>
                    <p className={`text-2xl font-black ${discountImpact.isProfitable ? 'text-purple-600' : 'text-red-600'}`}>
                      {(discountImpact.projectedProfit/1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Cash Freed</p>
                    <p className="text-2xl font-black text-orange-600">{(discountImpact.cashFreed/1000).toFixed(0)}K</p>
                  </div>
                </div>
              )}

              {discountImpact && (
                <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <p className="text-sm font-bold text-gray-800">
                    💡 At {discountScenario.discountPercent}% discount, you {discountImpact.isProfitable ? '✅ still make profit' : '❌ lose money'}.
                    Break-even discount is ~{discountImpact.breakEvenDiscount}%.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB - Enhanced */}
        {activeTab === 'recommendations' && (
          <div className="space-y-2">
            <h2 className="text-lg font-black text-gray-900">AI-Powered Recommendations</h2>
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <Target size={40} className="mx-auto text-green-500 mb-2" />
                <h3 className="text-lg font-black text-gray-900">All Good! 🎉</h3>
              </div>
            ) : (
              recommendations.map((rec, i) => (
                <div key={i} className={`bg-white rounded-lg p-3 shadow-md border-l-4 ${
                  rec.priority === 'critical' ? 'border-red-600 animate-pulse' : 
                  rec.priority === 'high' ? 'border-orange-600' : 'border-yellow-600'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={
                      rec.priority === 'critical' ? 'text-red-600' : 
                      rec.priority === 'high' ? 'text-orange-600' : 'text-yellow-600'
                    } size={18} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-gray-900">{rec.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                          rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-semibold mb-1">{rec.description}</p>
                      <div className="bg-gray-50 rounded p-1.5 mb-1">
                        <p className="text-xs text-gray-900 font-semibold">→ {rec.action}</p>
                      </div>
                      <p className="text-xs text-green-600 font-bold">✓ {rec.impact}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoolApeBusinessManager;