import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BiometricService {

    async isAvailable(): Promise<boolean> {
        if (!window.PublicKeyCredential) {
            return false;
        }

        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    async register(username: string): Promise<boolean> {
        try {
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
                    name: username,
                    displayName: username,
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
                const idBase64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                localStorage.setItem(`bio_id_${username}`, idBase64);
                localStorage.setItem(`bio_enabled_${username}`, 'true');
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
            const idBase64 = localStorage.getItem(`bio_id_${username}`);
            if (!idBase64) return false;

            const rawId = new Uint8Array(atob(idBase64).split("").map(c => c.charCodeAt(0)));

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                challenge,
                timeout: 60000,
                userVerification: 'preferred',
                allowCredentials: [{
                    id: rawId,
                    type: 'public-key',
                    transports: ['internal']
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
}
