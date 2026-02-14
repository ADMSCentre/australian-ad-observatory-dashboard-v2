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

> [!IMPORTANT]
>
> The code examples below are meant to serve as a reference and starting point for the implementation. They may not be complete or fully functional, and should be adapted as needed to fit the specific requirements and context of the project.

### Phase 1: Setup and API Integration

> **Original Task Description**:
>
> 1. Review existing API client setup and openapi-paths.ts for CCL endpoints
> 2. Create or update API functions to fetch entities and snapshots with pagination support
> 3. Add TypeScript types for entities and snapshots based on API response samples
> 4. Add routing for the new CCL Visualisation component in the dashboard
>
> Specifically, add a protected route on the front-end `ccl/advertisers` and `ccl/snapshots` to allow user to browse the list of advertisers and advertisement snapshots that have been scraped as part of the CCL enrichment, and view details of each advertiser/snapshot (e.g. advertiser name, snapshot text and media, etc). This will be useful for users to explore the data and understand what kind of enrichments are available. These routes should be browserable on the sidebar (under `Commercial Content Library` section) but should not be directly linked from anywhere else in the UI for now, as they are primarily meant for exploration. Should be paginated lists with a navigation (next/previous) to browse through the data.

#### Step 1.1: Create CCL API functions in `src/lib/api/ccl.ts`

Create a new API integration module following the pattern from `src/lib/api/mobile-observations.ts`:

```typescript
// src/lib/api/ccl.ts
import { createClient } from '@hey-api/openapi-fetch';
import type { paths } from './openapi-paths';
import config from '$lib/config';

const client = createClient<paths>({ baseUrl: config.apiUrls.api });

export interface CclEntitiesResponse {
	success: boolean;
	entities: Array<{
		id: string;
		ccl_enrichment_id: string;
		source_id: string;
		type: string;
		name: string;
		data: Record<string, any>;
	}>;
	pagination: { next_cursor: string | null; total: number };
}

export interface CclSnapshotsResponse {
	success: boolean;
	snapshots: Array<{
		id: string;
		ccl_enrichment_id: string;
		source_id: string;
		data: Record<string, any>;
	}>;
	pagination: { next_cursor: string | null; total: number };
}

// Fetch entities with cursor-based pagination
export async function fetchCclEntities(
	cursor?: string,
	limit: number = 10,
	authHeader?: HeadersInit
) {
	try {
		const { data, error } = await client.GET('/ccl/entities', {
			params: { query: { limit, ...(cursor && { cursor }) } },
			headers: authHeader
		});

		if (error) throw new Error(`API Error: ${error}`);
		return data as CclEntitiesResponse;
	} catch (error) {
		throw error instanceof Error ? error : new Error('Failed to fetch entities');
	}
}

// Fetch snapshots with cursor-based pagination
export async function fetchCclSnapshots(
	cursor?: string,
	limit: number = 10,
	authHeader?: HeadersInit
) {
	try {
		const { data, error } = await client.GET('/ccl/snapshots', {
			params: { query: { limit, ...(cursor && { cursor }) } },
			headers: authHeader
		});

		if (error) throw new Error(`API Error: ${error}`);
		return data as CclSnapshotsResponse;
	} catch (error) {
		throw error instanceof Error ? error : new Error('Failed to fetch snapshots');
	}
}
```

**Reference**: `src/lib/api/mobile-observations.ts:15-45` - Shows similar API function patterns

#### Step 1.2: Define TypeScript types in `src/lib/types/ccl.ts`

```typescript
// src/lib/types/ccl.ts
export interface EntityData {
	name: string;
	likes: number;
	country: string | null;
	page_id: string;
	category: string;
	image_uri: string;
	page_alias: string;
	entity_type: string;
	ig_username: string | null;
	ig_followers: number | null;
	verification: 'BLUE_VERIFIED' | 'NOT_VERIFIED';
	ig_verification: boolean | null;
	page_is_deleted: boolean;
	[key: string]: any;
}

export interface Entity {
	id: string;
	ccl_enrichment_id: string;
	source_id: string;
	type: string;
	name: string;
	data: EntityData;
}

export interface SnapshotCard {
	body: string;
	title: string;
	cta_text: string;
	cta_type: string;
	link_url: string;
	resized_image_url: string;
	original_image_url: string;
	[key: string]: any;
}

export interface Snapshot {
	id: string;
	ccl_enrichment_id: string;
	source_id: string;
	data: {
		page_name: string;
		is_active: boolean;
		snapshot: {
			body: { text: string };
			cards: SnapshotCard[];
			title: string;
			images: Array<{ resized_image_url: string }>;
			videos: Array<{ video_hd_url: string | null }>;
			[key: string]: any;
		};
		[key: string]: any;
	};
}
```

#### Step 1.3: Create CCL state manager in `src/lib/api/ccl.svelte.ts`

Following the pattern from `src/routes/mobile-observations/hidden-ads/hidden-ads.svelte.ts`:

**Caching Strategy**: Use `ccl_enrichment_id` as the unique identifier for caching enrichment data rather than `source_id`, as the enrichment_id is the canonical identifier in the CCL system.

```typescript
// src/lib/api/ccl.svelte.ts
import { session } from './session/session.svelte';
import { fetchCclEntities, fetchCclSnapshots } from './ccl';
import type { Entity, Snapshot } from '../types/ccl';

export class CclManager {
	// Entities state
	entities = $state<Entity[]>([]);
	entitiesLoading = $state(false);
	entitiesError = $state<string | null>(null);
	entitiesCursor = $state<string | null>(null);
	entitiesHasMore = $state(false);

	// Snapshots state
	snapshots = $state<Snapshot[]>([]);
	snapshotsLoading = $state(false);
	snapshotsError = $state<string | null>(null);
	snapshotsCursor = $state<string | null>(null);
	snapshotsHasMore = $state(false);

	// Cache: key = "entities_start_10" | "snapshots_cursor_10"
	private entitiesCache = new Map<string, Entity[]>();
	private snapshotsCache = new Map<string, Snapshot[]>();

	async loadEntities(cursor?: string, limit: number = 10) {
		const cacheKey = `entities_${cursor || 'start'}_${limit}`;

		// Check cache first
		if (this.entitiesCache.has(cacheKey)) {
			const cached = this.entitiesCache.get(cacheKey)!;
			this.entities = cached;
			return;
		}

		this.entitiesLoading = true;
		this.entitiesError = null;

		try {
			const response = await fetchCclEntities(cursor, limit, session.authHeader);
			this.entities = response.entities;
			this.entitiesCursor = response.pagination.next_cursor;
			this.entitiesHasMore = !!response.pagination.next_cursor;

			// Cache the result
			this.entitiesCache.set(cacheKey, response.entities);
		} catch (error) {
			this.entitiesError = error instanceof Error ? error.message : 'Failed to load entities';
		} finally {
			this.entitiesLoading = false;
		}
	}

	async loadSnapshots(cursor?: string, limit: number = 10) {
		const cacheKey = `snapshots_${cursor || 'start'}_${limit}`;

		if (this.snapshotsCache.has(cacheKey)) {
			const cached = this.snapshotsCache.get(cacheKey)!;
			this.snapshots = cached;
			return;
		}

		this.snapshotsLoading = true;
		this.snapshotsError = null;

		try {
			const response = await fetchCclSnapshots(cursor, limit, session.authHeader);
			this.snapshots = response.snapshots;
			this.snapshotsCursor = response.pagination.next_cursor;
			this.snapshotsHasMore = !!response.pagination.next_cursor;

			this.snapshotsCache.set(cacheKey, response.snapshots);
		} catch (error) {
			this.snapshotsError = error instanceof Error ? error.message : 'Failed to load snapshots';
		} finally {
			this.snapshotsLoading = false;
		}
	}

	nextEntities(limit: number = 10) {
		if (this.entitiesCursor) {
			this.loadEntities(this.entitiesCursor, limit);
		}
	}

	nextSnapshots(limit: number = 10) {
		if (this.snapshotsCursor) {
			this.loadSnapshots(this.snapshotsCursor, limit);
		}
	}

	resetEntities() {
		this.entities = [];
		this.entitiesCursor = null;
		this.entitiesHasMore = false;
		this.entitiesCache.clear();
		this.loadEntities();
	}

	resetSnapshots() {
		this.snapshots = [];
		this.snapshotsCursor = null;
		this.snapshotsHasMore = false;
		this.snapshotsCache.clear();
		this.loadSnapshots();
	}
}

export const cclManager = new CclManager();
```

**Reference**: `src/routes/mobile-observations/hidden-ads/hidden-ads.svelte.ts:1-100` - Shows similar manager pattern with state, loading, error handling

#### Step 1.4: Add sidebar navigation in `src/lib/components/app-sidebar/app-sidebar.svelte`

Add new navigation items under a "Commercial Content Library" section. Pattern follows `src/lib/components/app-sidebar/app-sidebar.svelte:120-160`:

```svelte
<!-- Inside the sidebar, add this section for CCL routes -->
{#if auth.currentUser?.role !== 'guest'}
	<SidebarSection title="Commercial Content Library">
		<SidebarItem
			icon={Database}
			label="CCL Advertisers"
			href="/ccl/advertisers"
			isActive={$page.url.pathname === '/ccl/advertisers'}
		/>
		<SidebarItem
			icon={FileText}
			label="CCL Snapshots"
			href="/ccl/snapshots"
			isActive={$page.url.pathname === '/ccl/snapshots'}
		/>
	</SidebarSection>
{/if}
```

#### Step 1.5: Create route files

1. **`src/routes/ccl/+layout.svelte`** - Layout wrapper (similar to `src/routes/mobile-observations/+layout.svelte`):

```svelte
<script>
	import { cclManager } from '$lib/api/ccl.svelte';
	import { onMount } from 'svelte';

	// Load initial entities on mount
	onMount(() => {
		if (cclManager.entities.length === 0) {
			cclManager.loadEntities();
		}
	});
</script>

<div class="flex flex-col gap-4 p-4">
	<h1 class="text-2xl font-bold">Commercial Content Library</h1>
	<slot />
</div>
```

2. **`src/routes/ccl/advertisers/+page.svelte`** - Create in next step (Phase 2)

3. **`src/routes/ccl/snapshots/+page.svelte`** - Create in next step (Phase 2)

### Phase 2: Component Development

> **Original Task Description**:
>
> 1. Create CCLVisualisation component with tabs for Entities and Snapshots
> 2. Implement EntitiesTable component with columns for key fields, sortable and filterable
> 3. Implement SnapshotsList component with card-based layout for ad previews
> 4. Add pagination controls for both sections
>
> Additionally, update `ads-browser` to automatically fetch and cache enrichments for observations when they are in view, to display whether or not there are enrichments available for an observation in the UI. If there are enrichments, a green `CCL Available` badge should be shown on the observation card. Otherwise, a grey `No CCL` badge should be shown. While the enrichments are being fetched, a loading spinner should be shown in place of the badge.
>
> Refactor the current `ad-rich-view.svelte` to use the new data structure to visualise the enrichments related to a specific observation.

#### Step 2.1: Create Entities List Page at `src/routes/ccl/advertisers/+page.svelte`

Multi-layer display similar to `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte`:

**Key Design Consideration**: Entities and snapshots are completely separate views with no cross-linking in the UI. The entities page is purely for exploring and browsing available advertiser entities, while snapshots are viewed independently.

```svelte
<script>
	import { cclManager } from '$lib/api/ccl.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';
	import EntityCard from './entity-card.svelte';
	import EntityDetailSheet from './entity-detail-sheet.svelte';

	let selectedEntity = $state<(typeof cclManager.entities)[0] | null>(null);

	// Load entities on page init
	$effect(() => {
		if (cclManager.entities.length === 0 && !cclManager.entitiesLoading) {
			cclManager.loadEntities();
		}
	});
</script>

<div class="flex flex-col gap-4">
	<!-- Header with title -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Advertisers ({cclManager.entities.length})</h2>
		{#if cclManager.entitiesLoading && cclManager.entities.length === 0}
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<Loader2 class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{/if}
	</div>

	<!-- Error message -->
	{#if cclManager.entitiesError}
		<div class="rounded-md bg-red-50 p-4 text-red-800">
			<p class="text-sm font-medium">Error loading entities</p>
			<p class="text-xs">{cclManager.entitiesError}</p>
		</div>
	{/if}

	<!-- Entities grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each cclManager.entities as entity (entity.id)}
			<EntityCard {entity} onSelect={() => (selectedEntity = entity)} />
		{/each}
	</div>

	<!-- Pagination controls -->
	<div class="flex items-center justify-between border-t pt-4">
		<p class="text-sm text-gray-600">
			{cclManager.entities.length} items loaded
			{#if cclManager.entitiesHasMore}
				• More available
			{:else}
				• End of results
			{/if}
		</p>
		{#if cclManager.entitiesHasMore}
			<Button
				variant="outline"
				disabled={cclManager.entitiesLoading}
				onclick={() => cclManager.nextEntities()}
			>
				{cclManager.entitiesLoading ? 'Loading...' : 'Load More'}
			</Button>
		{/if}
	</div>
</div>

<!-- Detail sheet modal -->
{#if selectedEntity}
	<EntityDetailSheet entity={selectedEntity} onClose={() => (selectedEntity = null)} />
{/if}
```

**Reference**: `src/routes/mobile-observations/+page.svelte:150-200` - Shows similar grid layout with loading states

#### Step 2.2: Create Entity Card Component at `src/routes/ccl/advertisers/entity-card.svelte`

```svelte
<script lang="ts">
  import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import type { Entity } from '$lib/types/ccl';

  interface Props {
    entity: Entity;
    onSelect: () => void;
  }

  const { entity, onSelect } = $props();

  const data = $derived(entity.data);
  const verificationColor = $derived.by(() =>
    entity.data.verification === 'BLUE_VERIFIED'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800'
  );
</script>

<Card
  class="cursor-pointer hover:shadow-md transition-shadow"
  onclick={onSelect}
>
  <CardHeader class="pb-3">
    {#if data.image_uri}
      <img
        src={data.image_uri}
        alt={data.name}
        class="h-32 w-full object-cover rounded-md mb-3"
      />
    {/if}
    <h3 class="font-semibold truncate">{entity.name}</h3>
  </CardHeader>

  <CardContent class="space-y-2">
    <!-- Category badge -->
    <div>
      <Badge variant="secondary" class="text-xs">
        {data.category || 'Unknown'}
      </Badge>
    </div>

    <!-- Core fields -->
    <div class="text-sm text-gray-600 space-y-1">
      <p>👍 {data.likes?.toLocaleString() || 0} likes</p>
      {#if data.ig_followers}
        <p>📱 {data.ig_followers?.toLocaleString() || 0} IG followers</p>
      {/if}
    </div>

    <!-- Verification status -->
    <div class="flex items-center gap-2">
      <Badge class={verificationColor} variant="outline" class="text-xs">
        {data.verification}
      </Badge>
      {#if data.country}
        <span class="text-xs text-gray-600">🌍 {data.country}</span>
      {/if}
    </div>
  </CardContent>
</Card>
```

**Reference**: `src/lib/components/data-table` components for card styling patterns

#### Step 2.3: Create Entity Detail Sheet at `src/routes/ccl/advertisers/entity-detail-sheet.svelte`

Multi-layer display with tabs (similar to `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte:1-50`):

```svelte
<script lang="ts">
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { Entity } from '$lib/types/ccl';

	interface Props {
		entity: Entity;
		onClose: () => void;
	}

	const { entity, onClose } = $props();
	const data = $derived(entity.data);
</script>

<Sheet open={true} onOpenChange={onClose}>
	<SheetContent class="max-w-2xl">
		<SheetHeader>
			<SheetTitle>{entity.name}</SheetTitle>
		</SheetHeader>

		<Tabs defaultValue="overview" class="mt-6">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="details">Details</TabsTrigger>
				<TabsTrigger value="raw">JSON</TabsTrigger>
			</TabsList>

			<!-- Overview Tab -->
			<TabsContent value="overview" class="space-y-4">
				{#if data.image_uri}
					<img src={data.image_uri} alt={data.name} class="h-48 w-full rounded-md object-cover" />
				{/if}

				<div class="space-y-3">
					<div>
						<p class="text-sm text-gray-600">Name</p>
						<p class="font-medium">{data.name}</p>
					</div>

					<div>
						<p class="text-sm text-gray-600">Category</p>
						<p class="font-medium">{data.category || 'N/A'}</p>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-600">Likes</p>
							<p class="font-medium">{data.likes?.toLocaleString() || 0}</p>
						</div>
						<div>
							<p class="text-sm text-gray-600">Country</p>
							<p class="font-medium">{data.country || 'Unknown'}</p>
						</div>
					</div>
				</div>
			</TabsContent>

			<!-- Details Tab - All fields in table format -->
			<TabsContent value="details" class="space-y-4">
				<div class="max-h-96 space-y-3 overflow-y-auto">
					{#each Object.entries(data) as [key, value]}
						{#if value !== null && value !== undefined && typeof value !== 'object'}
							<div class="border-b pb-2">
								<p class="text-xs font-semibold uppercase text-gray-600">{key}</p>
								<p class="text-sm text-gray-900">{String(value)}</p>
							</div>
						{/if}
					{/each}
				</div>
			</TabsContent>

			<!-- Raw JSON Tab -->
			<TabsContent value="raw">
				<pre class="overflow-x-auto rounded-md bg-gray-50 p-4 text-xs">
{JSON.stringify(data, null, 2)}
        </pre>
			</TabsContent>
		</Tabs>
	</SheetContent>
</Sheet>
```

**Reference**: `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte:40-120` - Sheet + Tabs pattern

#### Step 2.4: Create Snapshots List Page at `src/routes/ccl/snapshots/+page.svelte`

```svelte
<script>
	import { cclManager } from '$lib/api/ccl.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from 'lucide-svelte';
	import SnapshotCard from './snapshot-card.svelte';
	import SnapshotDetailSheet from './snapshot-detail-sheet.svelte';

	let selectedSnapshot = $state<(typeof cclManager.snapshots)[0] | null>(null);

	$effect(() => {
		if (cclManager.snapshots.length === 0 && !cclManager.snapshotsLoading) {
			cclManager.loadSnapshots();
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Advertisement Snapshots ({cclManager.snapshots.length})</h2>
		{#if cclManager.snapshotsLoading && cclManager.snapshots.length === 0}
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<Loader2 class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{/if}
	</div>

	{#if cclManager.snapshotsError}
		<div class="rounded-md bg-red-50 p-4 text-red-800">
			<p class="text-sm font-medium">Error loading snapshots</p>
			<p class="text-xs">{cclManager.snapshotsError}</p>
		</div>
	{/if}

	<!-- Snapshots list (card-based layout) -->
	<div class="space-y-4">
		{#each cclManager.snapshots as snapshot (snapshot.id)}
			<SnapshotCard {snapshot} onSelect={() => (selectedSnapshot = snapshot)} />
		{/each}
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between border-t pt-4">
		<p class="text-sm text-gray-600">
			{cclManager.snapshots.length} snapshots loaded
			{#if cclManager.snapshotsHasMore}
				• More available
			{:else}
				• End of results
			{/if}
		</p>
		{#if cclManager.snapshotsHasMore}
			<Button
				variant="outline"
				disabled={cclManager.snapshotsLoading}
				onclick={() => cclManager.nextSnapshots()}
			>
				{cclManager.snapshotsLoading ? 'Loading...' : 'Load More'}
			</Button>
		{/if}
	</div>
</div>

{#if selectedSnapshot}
	<SnapshotDetailSheet snapshot={selectedSnapshot} onClose={() => (selectedSnapshot = null)} />
{/if}
```

#### Step 2.5: Create Snapshot Card Component at `src/routes/ccl/snapshots/snapshot-card.svelte`

Inspired by ad preview styles from `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte`:

```svelte
<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { Snapshot } from '$lib/types/ccl';

	interface Props {
		snapshot: Snapshot;
		onSelect: () => void;
	}

	const { snapshot, onSelect } = $props();
	const snapshotData = $derived(snapshot.data.snapshot);
	const firstCard = $derived(snapshotData.cards[0]);
	const firstImage = $derived(
		firstCard?.resized_image_url || snapshotData.images[0]?.resized_image_url
	);
</script>

<Card class="cursor-pointer overflow-hidden transition-shadow hover:shadow-md" onclick={onSelect}>
	<div class="flex gap-4 p-4">
		<!-- Preview image -->
		{#if firstImage}
			<div class="flex-shrink-0">
				<img src={firstImage} alt="Ad preview" class="h-24 w-24 rounded-md object-cover" />
			</div>
		{/if}

		<CardContent class="flex-1 p-0">
			<!-- Page name and title -->
			<p class="text-xs text-gray-600">{snapshot.data.page_name}</p>
			<h3 class="mb-2 line-clamp-2 font-semibold">
				{snapshotData.title || firstCard?.title || 'Untitled Ad'}
			</h3>

			<!-- Preview of body/CTA -->
			{#if firstCard?.body}
				<p class="line-clamp-2 text-sm text-gray-700">
					{firstCard.body}
				</p>
			{/if}

			<!-- CTA info -->
			{#if firstCard?.cta_text}
				<div class="mt-2 inline-block">
					<span class="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
						{firstCard.cta_text}
					</span>
				</div>
			{/if}
		</CardContent>
	</div>
</Card>
```

#### Step 2.6: Create Snapshot Detail Sheet at `src/routes/ccl/snapshots/snapshot-detail-sheet.svelte`

```svelte
<script lang="ts">
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { Snapshot } from '$lib/types/ccl';

	interface Props {
		snapshot: Snapshot;
		onClose: () => void;
	}

	const { snapshot, onClose } = $props();
	const snapshotData = $derived(snapshot.data.snapshot);
</script>

<Sheet open={true} onOpenChange={onClose}>
	<SheetContent class="max-w-2xl overflow-y-auto">
		<SheetHeader>
			<SheetTitle>{snapshotData.title || 'Ad Snapshot'}</SheetTitle>
			<p class="mt-1 text-sm text-gray-600">{snapshot.data.page_name}</p>
		</SheetHeader>

		<Tabs defaultValue="preview" class="mt-6">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="preview">Preview</TabsTrigger>
				<TabsTrigger value="content">Content</TabsTrigger>
				<TabsTrigger value="raw">JSON</TabsTrigger>
			</TabsList>

			<!-- Preview Tab - Show cards and images -->
			<TabsContent value="preview" class="space-y-4">
				{#each snapshotData.cards as card, idx}
					<div class="space-y-3 rounded-lg border p-4">
						<h4 class="font-semibold">{card.title || 'Card ' + (idx + 1)}</h4>

						{#if card.resized_image_url}
							<img src={card.resized_image_url} alt={card.title} class="h-auto w-full rounded-md" />
						{/if}

						{#if card.body}
							<p class="whitespace-pre-wrap text-sm text-gray-700">{card.body}</p>
						{/if}

						{#if card.cta_text}
							<button class="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white">
								{card.cta_text}
							</button>
						{/if}
					</div>
				{/each}

				<!-- Extra images -->
				{#if snapshotData.images && snapshotData.images.length > 0}
					<div class="mt-6">
						<h4 class="mb-3 font-semibold">Additional Images</h4>
						<div class="grid grid-cols-2 gap-3">
							{#each snapshotData.images as img}
								<img
									src={img.resized_image_url}
									alt="Additional"
									class="h-auto w-full rounded-md"
								/>
							{/each}
						</div>
					</div>
				{/if}
			</TabsContent>

			<!-- Content Tab - Structured view -->
			<TabsContent value="content" class="space-y-4">
				<div class="max-h-96 space-y-3 overflow-y-auto">
					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-gray-600">Title</p>
						<p class="text-sm">{snapshotData.title}</p>
					</div>

					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-gray-600">Body</p>
						<p class="whitespace-pre-wrap text-sm">{snapshotData.body?.text || 'N/A'}</p>
					</div>

					<div class="border-b pb-3">
						<p class="text-xs font-semibold uppercase text-gray-600">CTA</p>
						<p class="text-sm">{snapshotData.cta_text || 'N/A'}</p>
					</div>

					{#if snapshotData.extra_texts && snapshotData.extra_texts.length > 0}
						<div class="border-b pb-3">
							<p class="text-xs font-semibold uppercase text-gray-600">Extra Text Fields</p>
							<ul class="space-y-1 text-sm">
								{#each snapshotData.extra_texts.slice(0, 10) as text}
									<li class="text-gray-700">• {text.text}</li>
								{/each}
								{#if snapshotData.extra_texts.length > 10}
									<li class="italic text-gray-600">
										... and {snapshotData.extra_texts.length - 10} more
									</li>
								{/if}
							</ul>
						</div>
					{/if}
				</div>
			</TabsContent>

			<!-- Raw JSON Tab -->
			<TabsContent value="raw">
				<pre class="overflow-x-auto rounded-md bg-gray-50 p-4 text-xs">
{JSON.stringify(snapshotData, null, 2)}
        </pre>
			</TabsContent>
		</Tabs>
	</SheetContent>
</Sheet>
```

**Reference**: `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte:120-250` - Similar sheet structure with card display

### Phase 3: UI/UX Enhancements & CCL Badge Integration

> **Original Task Description**:
>
> 1. Add loading spinners and error handling
> 2. Implement expandable details for snapshots (e.g., show cards, images)
> 3. Add search/filter functionality for entities by name, category, etc.
> 4. Ensure responsive design for mobile/tablet views

#### Step 3.1: Add CCL Badge to ads-browser

Update `src/routes/mobile-observations/+page.svelte` to show CCL availability status. This follows the pattern from `src/routes/mobile-observations/hidden-ads/hidden-ads.svelte.ts`:

**Key Implementation Details:**

- **Observation-Snapshot Linking**: Use the `observation_id` query parameter (not `source_id`) to check for CCL snapshots availability
- **Lazy Loading**: Query snapshots when the observation card becomes visible (on mount) to avoid over-querying
- **Badge Behavior**: Clicking the "CCL Available" badge opens the ad-rich-view for that specific observation with the CCL tab displayed by default
- **No Enrichment**: If no snapshots are returned, the observation has no enrichment data

> [!NOTE]
>
> **Decision: Lazy Loading Strategy**
>
> Using IntersectionObserver is the recommended approach for loading CCL availability badges. This provides better performance for large lists by only querying snapshots when cards scroll into viewport, rather than checking all visible cards on initial load.
>
> **Implementation Note**: The lazy loading check should use IntersectionObserver API to detect when observation cards become visible in the viewport, then trigger the CCL availability check for only those visible cards.

```svelte
<!-- In the ad observation card, add CCL badge -->
<script>
	import { cclManager } from '$lib/api/ccl.svelte';
	import { Loader2 } from 'lucide-svelte';

	let cclSnapshotCache = $state<Record<string, boolean>>({});
	let cclLoadingCache = $state<Record<string, boolean>>({});

	async function checkCclAvailability(observationId: string) {
		if (observationId in cclSnapshotCache) return;

		cclLoadingCache[observationId] = true;
		try {
			// Query snapshots for this specific observation using observation_id
			const { data } = await client.GET('/ccl/snapshots', {
				params: { query: { observation_id: observationId, limit: 1 } },
				headers: session.authHeader
			});

			cclSnapshotCache[observationId] = data?.snapshots?.length > 0 ?? false;
		} catch (error) {
			cclSnapshotCache[observationId] = false;
		} finally {
			cclLoadingCache[observationId] = false;
		}
	}

	function handleCclBadgeClick(observationId: string) {
		// Open ad-rich-view with CCL tab as default
		openAdRichView(observationId, 'ccl');
	}
</script>

<!-- In the card rendering loop -->
{#each observations as observation}
	<!-- Load CCL status when card is visible -->
	{#await (checkCclAvailability(observation.id), true)}
		<div class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
			<Loader2 class="h-3 w-3 animate-spin text-gray-600" />
			<span class="text-xs text-gray-600">Loading...</span>
		</div>
	{:then}
		<button
			class="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors"
			class:bg-green-100={cclSnapshotCache[observation.id]}
			class:bg-gray-100={!cclSnapshotCache[observation.id]}
			onclick={() => handleCclBadgeClick(observation.id)}
		>
			<span
				class="h-2 w-2 rounded-full"
				class:bg-green-600={cclSnapshotCache[observation.id]}
				class:bg-gray-400={!cclSnapshotCache[observation.id]}
			></span>
			<span
				class="text-xs font-medium"
				class:text-green-700={cclSnapshotCache[observation.id]}
				class:text-gray-600={!cclSnapshotCache[observation.id]}
			>
				{cclSnapshotCache[observation.id] ? 'CCL Available' : 'No CCL'}
			</span>
		</button>
	{/await}
{/each}
```

**Reference**: `src/routes/mobile-observations/+page.svelte:80-150` - Badge pattern in observation cards

#### Step 3.2: Add search/filter functionality for entities

Create `src/routes/ccl/advertisers/entity-filters.svelte`:

```svelte
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Select } from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		onSearchChange: (query: string) => void;
		onCategoryChange: (category: string) => void;
		onVerificationChange: (verification: string) => void;
	}

	const { onSearchChange, onCategoryChange, onVerificationChange } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('');
	let selectedVerification = $state('');

	function handleReset() {
		searchQuery = '';
		selectedCategory = '';
		selectedVerification = '';
		onSearchChange('');
		onCategoryChange('');
		onVerificationChange('');
	}
</script>

<div class="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
	<div class="grid grid-cols-1 gap-3 md:grid-cols-4">
		<Input
			type="text"
			placeholder="Search by name..."
			bind:value={searchQuery}
			onchange={() => onSearchChange(searchQuery)}
		/>

		<Select
			value={selectedCategory}
			onchange={(val) => {
				selectedCategory = val;
				onCategoryChange(val);
			}}
		>
			<option value="">All Categories</option>
			<option value="Media">Media</option>
			<option value="Product/service">Product/service</option>
			<option value="Retail company">Retail company</option>
			<!-- Add more from data -->
		</Select>

		<Select
			value={selectedVerification}
			onchange={(val) => {
				selectedVerification = val;
				onVerificationChange(val);
			}}
		>
			<option value="">All Verification</option>
			<option value="BLUE_VERIFIED">Blue Verified</option>
			<option value="NOT_VERIFIED">Not Verified</option>
		</Select>

		<Button variant="outline" onclick={handleReset}>Clear Filters</Button>
	</div>
</div>
```

Update `src/routes/ccl/advertisers/+page.svelte` to use filters:

```svelte
<script>
	let searchQuery = $state('');
	let categoryFilter = $state('');
	let verificationFilter = $state('');

	const filteredEntities = $derived.by(() => {
		return cclManager.entities.filter((entity) => {
			const matchesSearch =
				!searchQuery ||
				entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				entity.data.category?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory = !categoryFilter || entity.data.category === categoryFilter;
			const matchesVerification =
				!verificationFilter || entity.data.verification === verificationFilter;

			return matchesSearch && matchesCategory && matchesVerification;
		});
	});
</script>

<!-- Add filters before the grid -->
<EntityFilters
	onSearchChange={(q) => (searchQuery = q)}
	onCategoryChange={(c) => (categoryFilter = c)}
	onVerificationChange={(v) => (verificationFilter = v)}
/>

<!-- Display filtered entities -->
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each filteredEntities as entity (entity.id)}
		<EntityCard {entity} onSelect={() => (selectedEntity = entity)} />
	{/each}
</div>
```

**Reference**: `src/routes/mobile-observations/hidden-ads/hidden-ads.svelte:50-100` - Similar filtering pattern

#### Step 3.3: Add CCL Tab to ad-rich-view.svelte

Update `src/routes/mobile-observations/components/rich-view/ad-rich-view.svelte` to add a dedicated "CCL" tab alongside existing tabs (Capture, OCR, Candidates, Classifications, Table, JSON).

> [!NOTE]
>
> **Decision: Dedicated CCL Tab Implementation**
>
> A new dedicated "CCL" tab is the recommended approach. This provides clear separation from existing functionality and allows for a comprehensive display of CCL enrichment data with its own Preview/Content/JSON sub-structure, similar to how snapshots are displayed in the CCL snapshots detail sheet.
>
> **Implementation Details**:
>
> - Add new `Tabs.Trigger` value: `"ccl"` to the existing Tabs.List
> - Create `Tabs.Content` for CCL tab that displays snapshot preview (cards with images), content metadata, and raw JSON
> - Use the existing enrichment data from `currentAd.richDataObject.enrichment.ccl` if available
> - Default tab selection can be controlled by props/state to allow opening directly to the CCL tab when clicked from the badge

```svelte
<!-- In ad-rich-view.svelte, add to Tabs.List -->
<Tabs.List>
	{#if !auth.isGuest}
		<Tabs.Trigger value="captured-ad">Capture</Tabs.Trigger>
	{/if}
	<Tabs.Trigger value="ocr-data">OCR</Tabs.Trigger>
	<Tabs.Trigger value="candidate-ads">Candidates</Tabs.Trigger>
	<Tabs.Trigger value="ccl">CCL</Tabs.Trigger>
	<!-- NEW TAB -->
	<Tabs.Trigger value="classifications">Classifications</Tabs.Trigger>
	<Tabs.Trigger value="rich-data-table">Table</Tabs.Trigger>
	{#if !auth.isGuest}
		<Tabs.Trigger value="rich-data">JSON</Tabs.Trigger>
	{/if}
</Tabs.List>

<!-- Add new CCL tab content -->
<Tabs.Content value="ccl">
	{#if currentAd?.richDataObject?.enrichment?.ccl}
		<!-- Display CCL snapshot data similar to snapshot-detail-sheet -->
		<!-- Preview of cards with images, Content tab with metadata, Raw JSON -->
	{:else}
		<div class="flex items-center justify-center p-8 text-muted-foreground">
			<p>No CCL enrichment data available for this ad.</p>
		</div>
	{/if}
</Tabs.Content>
```

**Reference**: `src/routes/ccl/snapshots/snapshot-detail-sheet.svelte:1315-1430` - Shows CCL tab design pattern with Preview/Content/JSON structure

#### Step 3.4: Add responsive design improvements

Update component classes for mobile responsiveness:

```svelte
<!-- In entity-card.svelte and snapshot-card.svelte -->
<Card
  class="cursor-pointer hover:shadow-md transition-shadow
         w-full sm:max-w-sm md:max-w-full"
  onclick={onSelect}
>
  <!-- ... -->
</Card>

<!-- In sheets, ensure proper mobile sizing -->
<Sheet open={true} onOpenChange={onClose}>
  <SheetContent class="max-w-2xl max-h-[90vh] overflow-y-auto
                       sm:max-w-sm md:max-w-2xl">
```

#### Step 3.5: Implement loading spinners (already in components above)

The components already include:

- Loader2 spinner during fetch: `src/routes/ccl/advertisers/+page.svelte:18-22`
- Loading state in buttons: `src/routes/ccl/snapshots/+page.svelte:58-62`
- Skeleton loaders for cards (optional enhancement)

#### Step 3.6: Error handling toast notifications

Create helper in existing components:

```typescript
// In Phase 2 components, add toast on error
import { pushToast } from '$lib/components/toasts/toasts.svelte';

if (cclManager.entitiesError) {
	pushToast({
		type: 'error',
		message: 'Failed to load entities: ' + cclManager.entitiesError,
		timeout: 5000
	});
}
```

**Reference**: `src/routes/users/create-user-dialog.svelte:25-35` - Shows toast notification pattern

#### Step 3.7: Caching Strategy Configuration

> [!NOTE]
>
> **Decision: Cache Expiry**
>
> The CCL availability cache (used for observation badges) has **no expiry time**. Since CCL enrichment availability for observations changes infrequently, caching for the entire session is sufficient and provides optimal performance. The cache persists until the page is refreshed or the user navigates away from the session.

### Phase 4: Feature Documentation

Update the `docs/user-guide/viewing-ccl-enrichments` documentation (currently contains a `README.md` file) to include:

- Overview of CCL enrichments and their purpose
- Instructions on how to access the Advertisers and Snapshots pages
- Explanation of the CCL Available badge in the ads-browser and what it indicates
- How to access the CCL tab in the ad-rich-view for individual observations and what information is displayed there
- Screenshots of the new UI components (entities list, snapshots list, detail sheets). Use a `<TODO: Insert screenshot of ... here>` placeholder for now.
- FAQs about CCL enrichments (e.g., "Why don't I see a CCL Available badge?", "How often is CCL data updated?", etc.)
- Contact information for support or questions about CCL enrichments

## Additional Implementation Details

### Authentication

- **Method**: JWT Bearer token in Authorization header
- API requests should use existing authentication middleware/interceptor
- Do not use X-API-Key approach shown in curl examples

### UI Component Library

- **Framework**: shadcn/ui (or similar)
- Follow existing component patterns and styling conventions
- Reuse existing UI components where possible (buttons, cards, tables, etc.)

### State Management

- **Approach**: Universally reactive Svelte classes with Svelte 5 runes
- Example structure:

  ```typescript
  // advertisement-snapshots.svelte.ts
  class Pagination {
  	data = $state([]);
  	loading = $state(false);
  	cursor = $state(null);
  	// Methods to update state
  }

  class SnapshotStore {
  	pagination = new Pagination();
  }
  export const snapshotStore = new SnapshotStore();
  ```

- Implement caching within these reactive classes
- Import and use state in consumer components

### Feature Priority

1. **Phase 1**: Core visualization pages (entities and snapshots lists)
2. **Phase 2**: CCL Available badge in ads-browser (medium priority)
3. **Phase 3**: UI/UX enhancements

### Entity Display Design

- **Approach**: Multi-layer display similar to ad-rich-view.svelte
- **Core fields**: Prominently display name, category, verification status, likes
- **Extended view**: All available fields in expandable table or JSON viewer
- **Detail view**: When clicking an entity, show comprehensive view with all data fields organized logically
