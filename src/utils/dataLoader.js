// Simple CSV Parser
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i];
      return obj;
    }, {});
  });
};

export const loadCameraData = async () => {
  const response = await fetch('data/cameras.csv');
  const text = await response.text();
  const data = parseCSV(text);
  
  const brands = {};
  data.forEach(row => {
    if (!brands[row.Brand]) brands[row.Brand] = {};
    if (!brands[row.Brand][row.Model]) brands[row.Brand][row.Model] = [];
    brands[row.Brand][row.Model].push({
      name: row.Mode,
      width: parseFloat(row.Width),
      height: parseFloat(row.Height),
      resolution: row.Resolution,
      nativeAnamorphic: row.NativeAnamorphic === 'True',
      supportedSqueezes: row.SupportedSqueezes ? row.SupportedSqueezes.split(';').map(s => parseFloat(s)) : []
    });
  });
  return brands;
};

export const loadLensData = async () => {
  const response = await fetch('data/lenses.csv');
  const text = await response.text();
  const data = parseCSV(text);
  
  // Group by Series -> Squeeze, FocalLengths (with their specific ImageCircles)
  const seriesMap = {};
  data.forEach(row => {
    if (!seriesMap[row.Series]) {
      seriesMap[row.Series] = {
        name: row.Series,
        squeeze: parseFloat(row.Squeeze),
        lenses: [] // Array of { fl, ic }
      };
    }
    seriesMap[row.Series].lenses.push({
      fl: parseInt(row.FocalLength),
      ic: parseFloat(row.ImageCircle)
    });
  });
  
  return Object.values(seriesMap);
};