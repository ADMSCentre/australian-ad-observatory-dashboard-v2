export default function parseActivationCode(observerId: string): string | null {
	if (!observerId || observerId.length < 7) {
		return null; // Invalid observer ID
	}

	// The activation code is the 6 characters after the last character in the id
	const activationCode = observerId.slice(-7, -1);
	return activationCode;
}
