// Utility functions

export function formatPrice(amount) {
  const val = parseFloat(amount);
  if (isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatNumber(n) {
  const val = parseFloat(n);
  return isNaN(val) ? '0' : new Intl.NumberFormat('en-IN').format(val);
}

export function calcDiscountPercent(original, sale) {
  if (!sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch (e) {
    return "-";
  }
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getEstimatedDeliveryDate(pincode = null) {
  // Phase B1 Rule: Minimum 3 Days, Maximum 7 Days transit. 
  // Always add a 2-day handling buffer.
  const handlingBuffer = 2;
  
  // Default to maximum predictive duration until actual dispatch / specific pincode
  let transitDays = 7; 
  
  if (pincode && pincode.length === 6) {
    // Predictive e-commerce delivery logic mockup
    // (In full production, this maps user pincode vs warehouse pincode distances)
    const code = parseInt(pincode, 10);
    transitDays = (code % 5) + 3; // Resolves to realistically simulated 3-7 days transit
  }
  
  const totalDays = transitDays + handlingBuffer;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + totalDays);
  
  return {
    days: totalDays,
    date: deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short'
    }),
    isMaxPredictive: !pincode
  };
}

export function getStateFromPincode(pincode) {
  if (!pincode || pincode.length < 1) return "Delhi";
  const firstDigit = pincode.charAt(0);
  const firstTwo = pincode.substring(0, 2);

  const mapping = {
    "11": "Delhi",
    "12": "Haryana",
    "13": "Haryana",
    "14": "Punjab",
    "15": "Punjab",
    "16": "Chandigarh",
    "17": "Himachal Pradesh",
    "18": "Jammu & Kashmir",
    "19": "Jammu & Kashmir",
    "20": "Uttar Pradesh",
    "21": "Uttar Pradesh",
    "22": "Uttar Pradesh",
    "23": "Uttar Pradesh",
    "24": "Uttar Pradesh",
    "25": "Uttar Pradesh",
    "26": "Uttar Pradesh",
    "27": "Uttar Pradesh",
    "28": "Uttar Pradesh",
    "248": "Uttarakhand",
    "30": "Rajasthan",
    "31": "Rajasthan",
    "32": "Rajasthan",
    "33": "Rajasthan",
    "34": "Rajasthan",
    "36": "Gujarat",
    "37": "Gujarat",
    "38": "Gujarat",
    "39": "Gujarat",
    "40": "Maharashtra",
    "41": "Maharashtra",
    "42": "Maharashtra",
    "43": "Maharashtra",
    "44": "Maharashtra",
    "45": "Madhya Pradesh",
    "46": "Madhya Pradesh",
    "47": "Madhya Pradesh",
    "48": "Madhya Pradesh",
    "49": "Chhattisgarh",
    "50": "Telangana",
    "51": "Andhra Pradesh",
    "52": "Andhra Pradesh",
    "53": "Andhra Pradesh",
    "56": "Karnataka",
    "57": "Karnataka",
    "58": "Karnataka",
    "59": "Karnataka",
    "60": "Tamil Nadu",
    "61": "Tamil Nadu",
    "62": "Tamil Nadu",
    "63": "Tamil Nadu",
    "64": "Tamil Nadu",
    "67": "Kerala",
    "68": "Kerala",
    "69": "Kerala",
    "70": "West Bengal",
    "71": "West Bengal",
    "72": "West Bengal",
    "73": "West Bengal",
    "74": "West Bengal",
    "75": "Odisha",
    "76": "Odisha",
    "77": "Odisha",
    "78": "Assam",
    "79": "Assam",
    "80": "Bihar",
    "81": "Bihar",
    "82": "Bihar",
    "83": "Bihar",
    "84": "Bihar",
    "85": "Bihar",
  };

  return mapping[firstTwo] || mapping[firstDigit] || "Delhi";
}
