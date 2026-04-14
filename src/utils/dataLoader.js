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

const fetchCsv = async (path, label) => {
  let response;
  try {
    response = await fetch(path);
  } catch (networkErr) {
    throw new Error(`Could not reach ${label} data file (network error).`);
  }
  if (!response.ok) {
    throw new Error(`Failed to load ${label} data (HTTP ${response.status}).`);
  }
  const text = await response.text();
  if (text.trim().startsWith('<')) {
    throw new Error(`${label} data file is HTML, not CSV — check the deployment path.`);
  }
  return text;
};

export const loadCameraData = async () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  const text = await fetchCsv(`${publicUrl}/data/cameras.csv`, 'camera');
  const data = parseCSV(text);

  const brands = {};
  data.forEach(row => {
    if (!row.Brand || !row.Model) return; // Skip invalid rows
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

  if (Object.keys(brands).length === 0) {
    throw new Error('Camera data file loaded but no valid rows were found.');
  }
  return brands;
};

export const loadLensData = async () => {
  const publicUrl = process.env.PUBLIC_URL || '';
  const text = await fetchCsv(`${publicUrl}/data/lenses.csv`, 'lens');
  const data = parseCSV(text);
  
  // Group by Series -> Squeeze, FocalLengths (with their specific ImageCircles)
  const seriesMap = {};
  data.forEach(row => {
    if (!row.Series) return; // Skip invalid rows
    if (!seriesMap[row.Series]) {
      seriesMap[row.Series] = {
        name: row.Series,
        squeeze: parseFloat(row.Squeeze),
        lenses: [] // Array of { fl, ic }
      };
    }
    seriesMap[row.Series].lenses.push({
      fl: parseInt(row.FocalLength, 10),
      ic: parseFloat(row.ImageCircle)
    });
  });

  const series = Object.values(seriesMap);
  if (series.length === 0) {
    throw new Error('Lens data file loaded but no valid rows were found.');
  }
  return series;
};