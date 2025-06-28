// Basic encryption utilities for local storage
// In production, consider using more robust encryption libraries

export class SimpleEncryption {
  private key: string;

  constructor(password: string = 'default-key') {
    this.key = password;
  }

  // Simple XOR encryption (for demonstration - use proper encryption in production)
  encrypt(text: string): string {
    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
        );
      }
      return btoa(result); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Return original text if encryption fails
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Return encrypted text if decryption fails
    }
  }
}

// Create a default encryption instance
export const encryption = new SimpleEncryption();

// Secure local storage wrapper
export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = encryption.encrypt(serialized);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  },

  getItem: (key: string) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = encryption.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};
