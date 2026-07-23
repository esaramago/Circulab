const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
const NOMINATIM_HEADERS = {
  'Accept-Language': 'pt',
  'User-Agent': 'Circulab/1.0.0 (https://github.com/esaramago/Circulab)',
}

export async function guessCoordinates(
  address: string,
  postal_code?: string
): Promise<{ latitude: number, longitude: number } | null> {
  const street = address.trim()
  const postcode = postal_code && postal_code.trim() || ''
  if (!street) {
    return null
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      limit: '1',
      street,
      postalcode: postcode,
      countrycodes: 'pt',
    })
    const response = await fetch(
      `${NOMINATIM_URL}/search?${params}`,
      { headers: NOMINATIM_HEADERS },
    )
    const data = await response.json() as Array<{ lat?: string, lon?: string }>
    const result = data?.[0]
    if (!result?.lat || !result?.lon) {
      return null
    }
    return {
      latitude: Number(parseFloat(result.lat).toFixed(6)),
      longitude: Number(parseFloat(result.lon).toFixed(6)),
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}


export async function guessAdress(
  latitude: number,
  longitude: number
): Promise<{ address: string, postal_code: string } | null> {
  if (!latitude || !longitude) {
    return null
  }

  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      { headers: NOMINATIM_HEADERS },
    )
    const data = await response.json()
    
    if (data && data.address) {
      const road = data.address.road || data.address.pedestrian || ''
      const houseNumber = data.address.house_number || ''
      let address = road
      if (houseNumber) {
        address += `, ${houseNumber}`
      }
      if (!address) {
        address = data.display_name.split(',')[0]
      }
      return {
        address,
        postal_code: data.address.postcode || '',
      }
    }
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}