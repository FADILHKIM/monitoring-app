// resources/js/Utils/chartUtils.js

export function parseTimestampForChart(isoStringOrAntaresCt) {
  if (!isoStringOrAntaresCt) return null;
  let d = new Date(isoStringOrAntaresCt);
  if (!isNaN(d.getTime())) return d;

  if (typeof isoStringOrAntaresCt === 'string' && isoStringOrAntaresCt.length === 15 && isoStringOrAntaresCt.includes('T')) {
    const year = isoStringOrAntaresCt.substring(0, 4);
    const month = isoStringOrAntaresCt.substring(4, 6);
    const day = isoStringOrAntaresCt.substring(6, 8);
    const hour = isoStringOrAntaresCt.substring(9, 11);
    const minute = isoStringOrAntaresCt.substring(11, 13);
    const second = isoStringOrAntaresCt.substring(13, 15);
    const isoStringGenerated = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    try {
      d = new Date(isoStringGenerated);
      if (isNaN(d.getTime())) {
        return null;
      }
      return d;
    } catch (e) { 
      return null; 
    }
  }
  console.warn("parseTimestampForChart: Gagal mem-parse timestamp:", isoStringOrAntaresCt);
  return null;
}