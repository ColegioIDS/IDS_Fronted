export function cleanNulls(data: any): any {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(cleanNulls).filter(item => item !== undefined);
    }

    const result: any = {};
    for (const key in data) {
      const cleanedValue = cleanNulls(data[key]);
      if (cleanedValue !== undefined) {
        result[key] = cleanedValue;
      }
    }
    return result;
  }

  return data;
}