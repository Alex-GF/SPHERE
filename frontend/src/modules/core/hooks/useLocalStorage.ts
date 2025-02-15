import { useState } from "react";
import CryptoJS from "crypto-js";

export const useLocalStorage = () => {
    const [value, setValue] = useState<string | null>(null);

    const setItem = (key: string, value: string, _encrypt = true) => {
        let encryptedValue = value;
            if (_encrypt) {
                encryptedValue = CryptoJS.AES.encrypt(value, import.meta.env.VITE_SECRET_KEY as string).toString();
            }
        localStorage.setItem(key, encryptedValue);
        setValue(value);
    };

    const getItem = (key: string, _encrypt = true) => {
        let value = localStorage.getItem(key);
        if (value) {
            try {
                let decryptedValue = value;
                if (_encrypt) {
                    decryptedValue = CryptoJS.AES.decrypt(value, import.meta.env.VITE_SECRET_KEY as string).toString(CryptoJS.enc.Utf8);
                }
                setValue(decryptedValue);
                return decryptedValue;
            } catch (error) {
                console.error(error);
            }
        }
        setValue(value);
        return value;
    };

    const removeItem = (key: string) => {
        localStorage.removeItem(key);
        setValue(null);
    };

  return { value, setItem, getItem, removeItem };
};