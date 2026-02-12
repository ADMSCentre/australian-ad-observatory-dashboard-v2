Sample entities response:

```bash
curl -X 'GET' \
  'https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/ccl/entities?limit=10' \
  -H 'accept: application/json' \
  -H 'X-API-Key: secret-api-key'
```

```json
{
	"success": true,
	"entities": [
		{
			"id": "00000a2b5e5f99945491709565f9bd1b721a",
			"ccl_enrichment_id": "97cdcf72-e1b1-4af7-bee4-4b3631872b20",
			"source_id": "344798882317651",
			"type": "page",
			"name": "KiddoSpace",
			"data": {
				"name": "KiddoSpace",
				"likes": 5586,
				"country": null,
				"page_id": "344798882317651",
				"category": "Baby goods/children's goods",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/323360110_642493887562963_8577075725702040792_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=418b77&_nc_ohc=GkbPAiNPCN0Q7kNvwGyFcsj&_nc_oc=Adlut8CwPByfvamB0IkCHQwhYuA7oEwOXXafnXO0_P9Sl6BWwTwQ64IIjK_6iKFpj5s&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=k33YvQHf7JyfNWG7h70HFg&oh=00_Afh3yhrMIipgAijzNIaMGVq7jdIBFPe74Lhea3xbpRdXpw&oe=691AA692",
				"page_alias": "KiddoSpace.DE",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "thekiddospace_de",
				"ig_followers": 35997,
				"verification": "NOT_VERIFIED",
				"ig_verification": false,
				"page_is_deleted": false
			}
		},
		{
			"id": "000022a3d60cc868ad2ba6d56abbc7430714",
			"ccl_enrichment_id": "4a3c4ab2-45c6-4519-a62e-2b84e33faccb",
			"source_id": "111920877156284",
			"type": "page",
			"name": "Bottlemart",
			"data": {
				"name": "Bottlemart",
				"likes": 47,
				"country": null,
				"page_id": "111920877156284",
				"category": "Retail company",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/386460468_699167315576745_4052879731418620871_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=1&ccb=1-7&_nc_sid=418b77&_nc_ohc=hgTZSIm_C50Q7kNvwE0mGVW&_nc_oc=AdlFPYbt7RCqOBkvR6kFKg-MhW-VXJ4-tJqYh2HXK5QrX3YMWJT8bwaNRy19ioLSCB8&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=LYr-E8Z8Cb2NHZsmXrwHLA&oh=00_AfidcOPvsNlr0TobQM99E0SjU4fv5GFsMR9IWC3LQffJhg&oe=690DEB81",
				"page_alias": "",
				"entity_type": "PERSON_PROFILE",
				"ig_username": null,
				"ig_followers": null,
				"verification": "NOT_VERIFIED",
				"ig_verification": null,
				"page_is_deleted": false
			}
		},
		{
			"id": "000028b9d43c5e090bcf80fe69b758a59da6",
			"ccl_enrichment_id": "dba82edd-1519-49fc-b509-2791165f1ab0",
			"source_id": "362724980866366",
			"type": "page",
			"name": "Help Matt get to the USA & learn from the experts on Broadway & MORE",
			"data": {
				"name": "Help Matt get to the USA & learn from the experts on Broadway & MORE",
				"likes": 88,
				"country": null,
				"page_id": "362724980866366",
				"category": "Community",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/327348405_1685102968612673_4586531399782595754_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=418b77&_nc_ohc=mcr-vTP38yAQ7kNvwHlAdUm&_nc_oc=AdmmMHj2v9HBSPT8lwOmC_16TEDTf-FSPuLOlmHY25zgpBtxXGm0nT883z_eXwWTc88&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=XINgcBDv89wuYDZnWab8_w&oh=00_Afi8V_rPTDck6whIZgx6Qz9fwnM2xPi7LDT3Ghi1CyYTpw&oe=6913E8B2",
				"page_alias": "mattusatour",
				"entity_type": "PERSON_PROFILE",
				"ig_username": null,
				"ig_followers": null,
				"verification": "NOT_VERIFIED",
				"ig_verification": null,
				"page_is_deleted": false
			}
		},
		{
			"id": "00002d36d48af0509b682ad18ec81682a1cd",
			"ccl_enrichment_id": "b457b4ab-9e35-478f-a00f-e637c42d5d4e",
			"source_id": "116580098376181",
			"type": "page",
			"name": "Audible",
			"data": {
				"name": "Audible",
				"likes": 6447637,
				"country": "DE",
				"page_id": "116580098376181",
				"category": "Media",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/352732829_785265443038496_4134802768576343607_n.png?stp=dst-png_s200x200&_nc_cat=100&ccb=1-7&_nc_sid=418b77&_nc_ohc=JM_clnBjrucQ7kNvwH1yadE&_nc_oc=AdlY2R9URY_-hmXHjQYXU1gkOA6PAWN682qBD2doiZ_1PVgJnEIPiL1IjLxBJ29vwCY&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=4Kr2ZYScga7ZjP_ll0dUmg&oh=00_AfiOiXGxLjA_8zmfXDGNNiH3vvQPwHcUsDzgYqhQBInXPQ&oe=69128B45",
				"page_alias": "Audible.Hoerbuecher",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "audiblede",
				"ig_followers": 90559,
				"verification": "BLUE_VERIFIED",
				"ig_verification": true,
				"page_is_deleted": false
			}
		},
		{
			"id": "000061b1df396edcd817116184d1317fcfa4",
			"ccl_enrichment_id": "e634d5f4-c605-40fc-9ca4-c36152a73fc4",
			"source_id": "879726815412162",
			"type": "page",
			"name": "Barilla",
			"data": {
				"name": "Barilla",
				"likes": 2754644,
				"country": "IE",
				"page_id": "879726815412162",
				"category": "Food shop",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/399646580_733680705471211_6762651018349200292_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=418b77&_nc_ohc=krwo8iwwwA0Q7kNvwHMj5Zw&_nc_oc=AdlcTVHZ29wIkYtaZqCUnntGOqa5z5Ey4_CwEkWB9q_92ENrgiNBMsILUGvq2ptYpyI&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=acqedN-UzcKA2_bgs6DxKw&oh=00_AfdxFLoixEJXWBmjxt_Oo4usnYipfCsfSr0MkmZ7U6qUwQ&oe=69052FC6",
				"page_alias": "BarillaUK",
				"entity_type": "PERSON_PROFILE",
				"ig_username": null,
				"ig_followers": null,
				"verification": "BLUE_VERIFIED",
				"ig_verification": null,
				"page_is_deleted": false
			}
		},
		{
			"id": "00006587a6c69c25c9d66f48ba4b72a898ac",
			"ccl_enrichment_id": "fc099ec0-281c-48ec-b3c9-82a39b6cda7a",
			"source_id": "132760996590246",
			"type": "page",
			"name": "Halloween Nights at Kryal Castle",
			"data": {
				"name": "Halloween Nights at Kryal Castle",
				"likes": 125,
				"country": null,
				"page_id": "132760996590246",
				"category": "Live Music Venue",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/387084039_122095414862073478_7452352413193373682_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=418b77&_nc_ohc=bBCB3tlQbykQ7kNvwGEyJHo&_nc_oc=AdlhXw8Bo3BJg5dc-qhPU1eR1K96SFK1bZ_a3zWIoLX0LGz2q2mrFrPflDWE-bo8Fu8&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=5gohCawyjQdx3uMku3Gs5A&oh=00_AfYyEGSFTtsjRVNCClbK-JVlKxWvd9NDcSyC3tv1qzA4ew&oe=68E32EDC",
				"page_alias": "halloweennightsatkryalcastle",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "halloweennightsatkryalcastle",
				"ig_followers": 116,
				"verification": "NOT_VERIFIED",
				"ig_verification": false,
				"page_is_deleted": false
			}
		},
		{
			"id": "000065e59771d97d133626ad669d8262f20a",
			"ccl_enrichment_id": "0a26ba0a-8192-44a1-9e6c-ec0628fbd25a",
			"source_id": "530328736980952",
			"type": "page",
			"name": "Just For Men",
			"data": {
				"name": "Just For Men",
				"likes": 170358,
				"country": null,
				"page_id": "530328736980952",
				"category": "Product/service",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/339486076_198359889600844_5457448203798339847_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=418b77&_nc_ohc=ek2bnegvTxsQ7kNvwEcB-qB&_nc_oc=Adlx2j4Uu1E3XXZ2-NOFSRRYKJ9axK4J7X6JJztT6vQEO_F4Q3M4wGQG_ZYizlH9ZKk&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=XGc7BkTjCFeLhF3gBi88rw&oh=00_Afc0Xw7gJt5F4F5Rb93y-a1VsY8FOteXrmKh0xmUcFnEKw&oe=6908C8A7",
				"page_alias": "JFM",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "justformen",
				"ig_followers": 10863,
				"verification": "BLUE_VERIFIED",
				"ig_verification": true,
				"page_is_deleted": false
			}
		},
		{
			"id": "000068fae664484187376866af5fd76b7b0b",
			"ccl_enrichment_id": "f3d255e1-6cf9-47c7-a5f2-664c76aad3aa",
			"source_id": "104958548353196",
			"type": "page",
			"name": "Narre Warren North Liberals",
			"data": {
				"name": "Narre Warren North Liberals",
				"likes": 458,
				"country": null,
				"page_id": "104958548353196",
				"category": "Political organisation",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t1.6435-1/163283978_105889648260086_2168997221644067686_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=108&ccb=1-7&_nc_sid=418b77&_nc_ohc=d8aSxFLzKT8Q7kNvwFPYleH&_nc_oc=Adl9CDuL6mvJh3n5pHKMXfEE3SCTHguu9GFruxBXukkPoaRSlKxgs3lO5SxpH8EsXRg&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=2hvg7PCcI79pMCx08receA&oh=00_AfiA4F_GUUIk2x28FvKHeLgAzN_2f6PR3c4yFpDll2YxQg&oe=692F023A",
				"page_alias": "NarreWarrenNorthLiberals",
				"entity_type": "PERSON_PROFILE",
				"ig_username": null,
				"ig_followers": null,
				"verification": "NOT_VERIFIED",
				"ig_verification": null,
				"page_is_deleted": false
			}
		},
		{
			"id": "000086e0f0adfe071de30a73771c9dfd4bac",
			"ccl_enrichment_id": "47274020-c1ee-42e3-b53c-9b5ebc64943d",
			"source_id": "249672732259139",
			"type": "page",
			"name": "Metung Hot Springs",
			"data": {
				"name": "Metung Hot Springs",
				"likes": 19540,
				"country": null,
				"page_id": "249672732259139",
				"category": "Health Spa",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/216066489_941038539789218_2916122583219959251_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=418b77&_nc_ohc=-5TW1o63IFUQ7kNvwGnqtZu&_nc_oc=AdkNUk0k8NNOlEX_ugFPV9LwJTiArG5CG3h0Eb-WLzt3oRXe2vIp3PLzIsI7W8Y4f-I&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=5TO9qZoK-ICS5sdFrnAK8w&oh=00_Afi617ocNzvkRtf7wqa9x0w162xNxh6cEacpa-7mIUxPcg&oe=691D2EFB",
				"page_alias": "metunghotsprings",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "metunghotsprings",
				"ig_followers": 23692,
				"verification": "NOT_VERIFIED",
				"ig_verification": false,
				"page_is_deleted": false
			}
		},
		{
			"id": "0000a02c5eb61144ac0aacc35bcb5ddb9a5a",
			"ccl_enrichment_id": "9abe4285-d9c9-4f30-a1a6-b96e2ffd97c9",
			"source_id": "227657861880401",
			"type": "page",
			"name": "Tiny Bubbles On Tap",
			"data": {
				"name": "Tiny Bubbles On Tap",
				"likes": 1836,
				"country": null,
				"page_id": "227657861880401",
				"category": "Product/service",
				"image_uri": "https://scontent-syd2-1.xx.fbcdn.net/v/t39.30808-1/345854291_621083860076966_7873928353424244081_n.jpg?stp=dst-jpg_p200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=418b77&_nc_ohc=V_RYpxKP3LYQ7kNvwE567Gp&_nc_oc=AdlADBmcd7etpId1Ki--340TFIy7XBJB7gJ_gHkW6lBEwk1dj13fSPOM8Z_bM51wXu8&_nc_zt=24&_nc_ht=scontent-syd2-1.xx&_nc_gid=rzomqdmfpsA5LQG9NOrw_g&oh=00_AfhX5FZbTdLXYBPm3RbLoWFFMum3S5c6Gy8j3bKtmKptPA&oe=691FAFCE",
				"page_alias": "tinybubblesontap",
				"entity_type": "PERSON_PROFILE",
				"ig_username": "tinybubblesontap",
				"ig_followers": 1802,
				"verification": "NOT_VERIFIED",
				"ig_verification": false,
				"page_is_deleted": false
			}
		}
	],
	"pagination": {
		"next_cursor": "0000a02c5eb61144ac0aacc35bcb5ddb9a5a",
		"total": 1
	}
}
```

Sample CCL Snapshots Response:

```bash
curl -X 'GET' \
  'https://f06kj1k332.execute-api.ap-southeast-2.amazonaws.com/dev/ccl/snapshots?limit=10' \
  -H 'accept: application/json' \
  -H 'X-API-Key: secret-api-key'
```

```json
{
	"success": true,
	"snapshots": [
		{
			"id": "00000d75b4f161ce4683ff00517a8c8070ef",
			"ccl_enrichment_id": "35c565aa-c4b1-4142-82f9-43597bbec594",
			"source_id": "1069881368673264",
			"data": {
				"ad_id": null,
				"spend": null,
				"page_id": "206569879355827",
				"currency": "",
				"end_date": 1761462000,
				"fev_info": null,
				"snapshot": {
					"body": {
						"text": "{{product.brand}}"
					},
					"cards": [
						{
							"body": "Australia needs skilled workers like you!\nUnlock a new world of possibilities with the Temporary Skill Shortage Visa (Subclass 482).\n• High demand for your skills \n• Better work-life balance and quality of life\n\nReady to start building your future Down Under? Apply now!",
							"title": "Apply for 482 Visa Now",
							"caption": "",
							"cta_text": "Apply Now",
							"cta_type": "APPLY_NOW",
							"link_url": "http://fb.me/",
							"image_crops": [],
							"video_hd_url": null,
							"video_sd_url": null,
							"link_description": " ",
							"resized_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/3283d57b-0f35-4cc3-a37a-86ffb4fee692.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=XYL51Fb70HME0qLeGLiR5dtF23U%3D&Expires=1770786739",
							"original_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/44386eb1-ef17-4567-9e7b-6c2b311c7ac9.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=cGQ2LLRg5rcRiKHNdK4nLqQYfCI%3D&Expires=1770786739",
							"video_preview_image_url": null,
							"watermarked_video_hd_url": null,
							"watermarked_video_sd_url": null,
							"watermarked_resized_image_url": ""
						},
						{
							"body": "Australia needs skilled workers like you!\nUnlock a new world of possibilities with the Temporary Skill Shortage Visa (Subclass 482).\n• High demand for your skills \n• Better work-life balance and quality of life\n\nReady to start building your future Down Under? Apply now!",
							"title": "Apply for 482 Visa Now",
							"caption": "",
							"cta_text": "Apply Now",
							"cta_type": "APPLY_NOW",
							"link_url": "http://fb.me/",
							"image_crops": [],
							"video_hd_url": null,
							"video_sd_url": null,
							"link_description": " ",
							"resized_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/cc561c61-f3b4-4735-879f-dc952bca3461.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=lb3egCSvbrBiwfGGZOEe3Yds3PA%3D&Expires=1770786739",
							"original_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/ce22c96c-f90f-43d5-a5d2-a5c7913426a3.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=9u2em6OjpQhWlTYWBHjcyczbgRk%3D&Expires=1770786739",
							"video_preview_image_url": null,
							"watermarked_video_hd_url": null,
							"watermarked_video_sd_url": null,
							"watermarked_resized_image_url": ""
						}
					],
					"event": null,
					"title": "{{product.name}}",
					"byline": null,
					"images": [],
					"videos": [],
					"caption": "fb.me",
					"page_id": "206569879355827",
					"cta_text": "Apply now",
					"cta_type": "APPLY_NOW",
					"link_url": "http://fb.me/",
					"page_name": "Y-Axis Australia",
					"extra_links": ["https://www.y-axis.com/privacy-policy/"],
					"extra_texts": [
						{
							"text": "Get Settled in Australia with TSS Visa Now"
						},
						{
							"text": "Inviting 500k Migrants by 2027"
						},
						{
							"text": "400,000 Job Vacancies"
						},
						{
							"text": "Please Fill Your Details For FREE Consultation."
						},
						{
							"text": "What is your Highest Education?"
						},
						{
							"text": "Bachelors"
						},
						{
							"text": "Masters"
						},
						{
							"text": "PhD"
						},
						{
							"text": "Other"
						},
						{
							"text": "Choose your years of Experience?"
						},
						{
							"text": "Fresher"
						},
						{
							"text": "1"
						},
						{
							"text": "2"
						},
						{
							"text": "3"
						},
						{
							"text": "4"
						},
						{
							"text": "5"
						},
						{
							"text": "6"
						},
						{
							"text": "7"
						},
						{
							"text": "8"
						},
						{
							"text": "9"
						},
						{
							"text": "10"
						},
						{
							"text": "10+"
						},
						{
							"text": "What is your current industry/job role?"
						},
						{
							"text": "Healthcare Professionals"
						},
						{
							"text": "Information Technology (IT) Specialists"
						},
						{
							"text": "Engineering Professionals"
						},
						{
							"text": "Construction and Skilled Trades"
						},
						{
							"text": "Education Professionals"
						},
						{
							"text": "Accounting and Finance"
						},
						{
							"text": "Hospitality"
						},
						{
							"text": "Psychologists"
						},
						{
							"text": "Agricultural Professionals"
						},
						{
							"text": "What is your age?"
						},
						{
							"text": "23"
						},
						{
							"text": "24"
						},
						{
							"text": "25"
						},
						{
							"text": "26"
						},
						{
							"text": "27"
						},
						{
							"text": "28"
						},
						{
							"text": "29"
						},
						{
							"text": "30"
						},
						{
							"text": "31"
						},
						{
							"text": "32"
						},
						{
							"text": "33"
						},
						{
							"text": "34"
						},
						{
							"text": "35"
						},
						{
							"text": "36"
						},
						{
							"text": "37"
						},
						{
							"text": "38"
						},
						{
							"text": "39"
						},
						{
							"text": "40"
						},
						{
							"text": "41"
						},
						{
							"text": "42"
						},
						{
							"text": "43"
						},
						{
							"text": "44"
						},
						{
							"text": "45"
						},
						{
							"text": "46"
						},
						{
							"text": "47"
						},
						{
							"text": "First name"
						},
						{
							"text": "Last name"
						},
						{
							"text": "Email"
						},
						{
							"text": "Phone number"
						},
						{
							"text": "Country"
						},
						{
							"text": "Terms and Conditions for Y-Axis Australia"
						},
						{
							"text": "Privacy Policy"
						}
					],
					"is_reshared": false,
					"extra_images": [
						{
							"image_crops": [],
							"resized_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/e9562dd1-d3c8-4e3c-b40e-d2c3c0fb3768.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=%2FPbG6LSHtsUmoK9mHTlURm1tRyw%3D&Expires=1770786739",
							"original_image_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/4abdf6d8-27ff-4783-a8b3-c1e9485ae0e0.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=5MljL3nbYH5DsXe03PQ3w5s52Io%3D&Expires=1770786739"
						}
					],
					"extra_videos": [],
					"brazil_tax_id": null,
					"display_format": "DCO",
					"additional_info": null,
					"branded_content": null,
					"ec_certificates": [],
					"page_categories": ["Consulting agency"],
					"page_is_deleted": false,
					"page_like_count": 27859,
					"country_iso_code": null,
					"disclaimer_label": null,
					"link_description": "{{product.description}}",
					"page_profile_uri": "https://www.facebook.com/yaxisaustralia/",
					"root_reshared_post": null,
					"page_profile_picture_url": "https://fta-mobile-observations-v2-ccl.s3.amazonaws.com/outputs/meta_adlibrary/meta_adlibrary_scrapes/124f6c1d-9b1c-466e-9e4e-3cb8f8ebfb61/mass_download/91429904-252c-4268-bfc1-1ff1bd323326.jpeg?AWSAccessKeyId=AKIAXSEERVXSNWV26GOB&Signature=Uj4Nnb2NxKxhxh3t1HRrdwurrxQ%3D&Expires=1770786739"
				},
				"is_active": true,
				"page_name": "Y-Axis Australia",
				"categories": ["UNKNOWN"],
				"gated_type": "ELIGIBLE",
				"menu_items": [],
				"start_date": 1754982000,
				"collation_id": "1936103583839268",
				"report_count": null,
				"ad_archive_id": "1069881368673264",
				"reach_estimate": null,
				"collation_count": 1,
				"is_aaa_eligible": false,
				"page_is_deleted": false,
				"hide_data_status": "NONE",
				"has_user_reported": false,
				"total_active_time": null,
				"publisher_platform": ["FACEBOOK", "INSTAGRAM"],
				"state_media_run_label": null,
				"impressions_with_index": {
					"impressions_text": null,
					"impressions_index": -1
				},
				"is_related_to_query_term": true,
				"regional_regulation_data": {
					"finserv": {
						"is_deemed_finserv": false,
						"is_limited_delivery": false
					},
					"tw_anti_scam": {
						"is_limited_delivery": false
					}
				},
				"contains_sensitive_content": false,
				"targeted_or_reached_countries": [],
				"contains_digital_created_media": false
			}
		}
	],
	"pagination": {
		"next_cursor": "00000d75b4f161ce4683ff00517a8c8070ef",
		"total": 1
	}
}
```

## Task Specification

### Objective

Create a visualisation dashboard for CCL Enrichment data that displays entities (pages) and snapshots (ad data) fetched from the CCL API endpoints `/ccl/entities` and `/ccl/snapshots`.

### Requirements

- Fetch and display a list of entities with key fields: id, name, type, data (including likes, category, verification status, etc.)
- Fetch and display a list of snapshots with key fields: id, page_name, snapshot details (body, cards, images, videos), and metadata
- Implement pagination for both endpoints using the provided cursor-based pagination
- Make use of existing `rich-ad-view.svelte` to inspire the design of the snapshots display
- Handle loading states and errors gracefully
- Ensure the component is integrated into the dashboard's routing and navigation

### Acceptance Criteria

- Component loads without errors and fetches data successfully
- Entities table shows paginated list with essential fields
- Snapshots list shows paginated ad data with expandable details
- UI is responsive and follows existing design patterns
- API calls are authenticated as required (API key or JWT)

## Implementation Plan

### Phase 1: Setup and API Integration

1. Review existing API client setup and openapi-paths.ts for CCL endpoints
2. Create or update API functions to fetch entities and snapshots with pagination support
3. Add TypeScript types for entities and snapshots based on API response samples
4. Add routing for the new CCL Visualisation component in the dashboard

Specifically, add a protected route on the front-end `ccl/advertisers` and `ccl/snapshots` to allow user to browse the list of advertisers and advertisement snapshots that have been scraped as part of the CCL enrichment, and view details of each advertiser/snapshot (e.g. advertiser name, snapshot text and media, etc). This will be useful for users to explore the data and understand what kind of enrichments are available. These routes should be browserable on the sidebar (under `Commercial Content Library` section) but should not be directly linked from anywhere else in the UI for now, as they are primarily meant for exploration. Should be paginated lists with a navigation (next/previous) to browse through the data.

### Phase 2: Component Development

1. Create CCLVisualisation component with tabs for Entities and Snapshots
2. Implement EntitiesTable component with columns for key fields, sortable and filterable
3. Implement SnapshotsList component with card-based layout for ad previews
4. Add pagination controls for both sections

Additionally, update `ads-browser` to automatically fetch and cache enrichments for observations when they are in view, to display whether or not there are enrichments available for an observation in the UI. If there are enrichments, a green `CCL Available` badge should be shown on the observation card. Otherwise, a grey `No CCL` badge should be shown. While the enrichments are being fetched, a loading spinner should be shown in place of the badge.

Refactor the current `ad-rich-view.svelte` to use the new data structure to visualise the enrichments related to a specific observation.


### Phase 3: UI/UX Enhancements

1. Add loading spinners and error handling
2. Implement expandable details for snapshots (e.g., show cards, images)
3. Add search/filter functionality for entities by name, category, etc.
4. Ensure responsive design for mobile/tablet views