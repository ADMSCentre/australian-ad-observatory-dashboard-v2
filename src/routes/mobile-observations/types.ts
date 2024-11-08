export interface QuickAccessCache {
	success: boolean;
	data: Data;
}

export interface Data {
	observations: string[];
	ads: string[];
	ads_passed_ocr: string[];
	ads_passed_ad_scrape: string[];
	ads_passed_mass_download: string[];
}
