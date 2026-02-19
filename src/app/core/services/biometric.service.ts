import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BiometricService {

    async isAvailable(): Promise<boolean> {
        if (!window.PublicKeyCredential) {
            return false;
        }

        try {
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (e) {
            console.error('Error checking biometric availability:', e);
            return false;
        }
    }

    async register(username: string): Promise<boolean> {
        try {
            const cleanUsername = username.trim();
            if (!cleanUsername) return false;

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const userId = new Uint8Array(16);
            window.crypto.getRandomValues(userId);

            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: 'Physis Ticket Scanner',
                },
                user: {
                    id: userId,
                    name: cleanUsername,
                    displayName: cleanUsername,
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'preferred',
                    residentKey: 'required'
                },
                timeout: 60000,
                attestation: 'none'
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            }) as PublicKeyCredential;

            if (credential) {
                // Robust storage of credential ID
                const idBase64 = this.bufferToBase64(credential.rawId);
                localStorage.setItem(`bio_id_${cleanUsername}`, idBase64);
                localStorage.setItem(`bio_enabled_${cleanUsername}`, 'true');
                console.log(`Biometric registered for ${cleanUsername}`);
                return true;
            }
            return false;

        } catch (e) {
            console.error('Biometric registration error:', e);
            return false;
        }
    }

    async login(username: string): Promise<boolean> {
        try {
            const cleanUsername = username.trim();
            if (!cleanUsername) return false;

            const idBase64 = localStorage.getItem(`bio_id_${cleanUsername}`);
            if (!idBase64) {
                console.warn(`No biometric ID found for ${cleanUsername}`);
                return false;
            }

            const rawId = this.base64ToBuffer(idBase64);
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                challenge,
                timeout: 60000,
                userVerification: 'preferred',
                allowCredentials: [{
                    id: rawId,
                    type: 'public-key'
                }]
            };

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            return !!assertion;
        } catch (e) {
            console.error('Biometric login error:', e);
            return false;
        }
    }

    private bufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private base64ToBuffer(base64: string): ArrayBuffer {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
