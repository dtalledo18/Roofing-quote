"use client";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

interface AddressSearchProps {
    onAddressSelect: (address: string, lat: number, lng: number) => void;
}

export const AddressSearch = ({ onAddressSelect }: AddressSearchProps) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "us" }, // Solo USA
            locationBias: "IP_BIAS", // Prioriza resultados cercanos (Chicago)
        },
        debounce: 300,
    });

    const handleSelect = async (description: string) => {
        setValue(description, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address: description });
            const { lat, lng } = await getLatLng(results[0]);
            onAddressSelect(description, lat, lng);
        } catch (error) {
            console.error("Error al obtener geolocalización:", error);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 outline-none text-black"
                placeholder="Enter your Chicago address..."
            />
            {status === "OK" && (
                <ul className="absolute z-10 w-full bg-white border rounded-b-lg shadow-lg mt-1">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-black"
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};