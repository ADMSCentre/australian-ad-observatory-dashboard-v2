# The Exports Route

This `exports` route make uses of the different `exports` API endpoints defined in the `openapi-paths.ts` file in `src/lib/api/`. It provides functionality for users to export data with various settings. This is a protected route and can only be accessed by authenticated users.

This route includes components and logic to handle user requests for data exports, manage export jobs (listing, status tracking, downloading) and configure export parameters. An export job request looks like so:

```json
{
   // The query to narrow down the data to be exported, compatible with existing API query structure
   "query": {
    "method": "OBSERVER_ID_CONTAINS",
    "args": ["123456"] // Example activation code
   },
   // Whether to include the images associated with the ads
   "include_images": true,
   "fields": ["observation_id", "observer_id", "ocr.x", "ocr.y", "ocr.text", "ocr.confidence", "attributes.starred.value", "tags", "classifications"] // Optional: specify fields to include. If omitted, include only "default" fields.
}
```

The available fields can be retrieved from the `GET /exports/fields` endpoint, which returns a list of all possible fields that can be included in an export, for example:

```json
[
  {
    "id": "364d7c8c-bdf7-471d-845f-bd3896c4e1cc",
    "name": "Observer UUID",
    "description": "The Unique identification code of the Observer, of which the Activation code is derived from.",
    "path": "observer.uuid",
    "is_default": true
  },
  {
    "id": "978b80b9-1f0c-4ab1-80c6-f0e448e56582",
    "name": "Observation UUID",
    "description": "The unique identifier for an observation, or ad.",
    "path": "observation.uuid",
    "is_default": true
  }
]
```

The above fields can be used in the `fields` array when creating an export job to specify which data fields should be included in the export. The user can choose to include all fields or just a subset based on their requirements using checkboxes in the UI. 

There should be an option to include images as well, which will add the associated ad images to the export package. This option should be a toggle button in the UI, making it extremely clear for user to tell if images will be included in the export or not. If user chooses to include images, warning text should be displayed to inform them that including images may significantly increase the size of the export file and the time taken to generate it.

The most important part of the creation process is the query section, which allows users to filter the data they want to export. The query structure should be compatible with the existing API query structure used in the `query-cell` component. The UI should be similar to the `query-cell` component (albeit not dependent on a project), allowing users to build complex queries using various methods and arguments. This will ensure consistency across the application and make it easier for users to understand how to create their export queries. There should be an `Browse Ads` accordion section that allows users to preview the ads that match their query before creating the export job. This should make use of the `AdsBrowser` component in a similar manner to the `query-cell` component.

The above information should be presented in a form that is accessible through a `Create Export` button on the main exports page. Once the user fills out the form and submits it, a new export job should be created using the `POST /exports/` endpoint with the provided parameters. After submission, the user should be redirected back to the main exports page where they can see their newly created export job in the list, along with its status.

The exports of a user (including shared exports) can be accessed through the `GET /exports/` endpoint, which returns a list of export jobs with their details such as ID, status, created date, and download link (if available), like so:

```json
[
  {
    "export_id": "ac0dbe27-1946-4acb-b5e2-d8095306dd01",
    "creator_id": "b2d65bce-026e-42a4-ac56-059894c15560",
    "export_parameters": {
      "query": {
        "method": "OBSERVATION_ID_CONTAINS",
        "args": [
          "b2c11dfe295b"
        ]
      },
      "include_images": false,
      "fields": []
    },
    "shared_with": [],
    "status": "completed",
    "url": "https://object-store.rc.nectar.org.au/v1/AUTH_ed912d55709c467aa9f711a6ed0f7cd9/australian-ad-observatory-exports/b2d65bce-026e-42a4-ac56-059894c15560_ac0dbe27-1946-4acb-b5e2-d8095306dd01_20260115003805.zip?temp_url_sig=8468aff31e8cfafc72af49936f2a2000537a8006798267c6a16c3a9ef438c126&temp_url_expires=1768448792",
    "created_at": "2026-01-15T00:36:00.770465",
    "updated_at": "2026-01-15T00:38:07.677755",
    "started_at": null,
    "completed_at": null,
    "message": null
  }
]
```

The main exports page should display this list in a list format where each row represents an export job. Each row should show the export job's ID, status (e.g., pending - `<ClockFading />`, in progress - rotating `<LoaderCircle />`, completed - a green `<Check />`, failed - a red `<CircleX />` that shows the error message in a tooltip, and ask the user to contact support), created date, completed date and a download button if the export is completed. The row should also show a `Manage Access (X <User />)` button that opens a model allowing the user to manage who the export is shared with by adding or removing users from a dropdown list of users (in a similar manner to the dropdown in the `project-members.svelte` component). Note that the `shared_with` field contains a list of user IDs that the export is shared with, so the frontend will need to resolve these IDs to proper display names through `session.users`, in a similar manner to the `project-member-row.svelte` component. Each shared member should be a small badge with an `X` button to remove them from the shared list. Only the creator of the export job should be able to see and use the `Manage Access` button.

Additionally, there is an "Expand" button on each row that reveals more details about the export job, such as the query used, fields included, whether images were included, and a `Browse Ads` accordion section that allows users to preview the ads included in that export job using the same `AdsBrowser` component. This should be similar to the export-creation form but in a read-only format.