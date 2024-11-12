const DASHBOARD_API_URL =
	'https://i7dy5tidoi.execute-api.us-east-2.amazonaws.com/default/fta-dashboard-instance';
type ApiActionType = 'presign' | 'platform_items_v3' | 'authenticate_educational';

export async function useDashboardAPI({
	actionType,
	data,
	encode = true
}: {
	actionType: ApiActionType;
	data: unknown;
	encode?: boolean;
}) {
	// The API uses base64 encoding - if we don't encode, the API will return a 500 error
	const jsonInput = JSON.stringify({
		action: actionType,
		data
	});
	console.log('useDashboardAPI', JSON.parse(jsonInput));
	const response = await fetch(DASHBOARD_API_URL, {
		method: 'POST',
		body: encode ? btoa(jsonInput) : jsonInput
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch ${actionType} with status ${response.status}`);
	}
	return response.json();
}
