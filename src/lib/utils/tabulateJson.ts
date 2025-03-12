interface InputData {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export type Field = {
	key: string;
	unindexed: string;
	contentType: string;
	ancestorArrayKeys: string[];
	value?: string | number;
};

export function getFields(input: InputData) {
	// Recursive function to get all keys in the input object
	// in the form of an array of strings, where each string
	// represents a key (possibly nested) in the object that
	// does not contain any object or array values.
	// Array values are represented as [index] in the key.
	const unindexKey = (key: string) =>
		key
			// Remove all [index] from the keys
			.replace(/\[\d+\]/g, '')
			// Remove trailing dots
			.replace(/\.*$/, '')
			// Replace multiple dots with a single dot
			.replace(/\.{2,}/g, '.');
	const keys: Field[] = [];
	const processObject = (input: InputData, parent: Field, isParentArray: boolean) => {
		Object.keys(input).forEach((key) => {
			let newKey = parent.key ? `${parent.key}.${key}` : key;
			if (isParentArray) {
				newKey = `${parent.key}.[${key}]`;
			}
			// If is primitive value (not an object or array), add to keys
			if (typeof input[key] !== 'object' || input[key] === null) {
				keys.push({
					key: newKey,
					unindexed: unindexKey(newKey),
					contentType: typeof input[key],
					value: input[key],
					ancestorArrayKeys: parent.ancestorArrayKeys
				});
				return;
			}
			// Recursively process nested objects
			processObject(
				input[key],
				{
					key: newKey,
					unindexed: unindexKey(newKey),
					contentType: typeof input[key],
					ancestorArrayKeys: isParentArray
						? // If parent is an array, add parent key to ancestorArrayKeys
							parent.ancestorArrayKeys.concat(newKey)
						: parent.ancestorArrayKeys
				},
				Array.isArray(input[key])
			);
		});
		if (isParentArray) {
			keys.push(parent);
		}
	};
	processObject(
		input,
		{
			key: '',
			unindexed: '',
			contentType: typeof input,
			ancestorArrayKeys: []
		},
		false
	);
	// const primitiveKeys = keys.filter(
	// 	(key) => key.contentType !== 'object' && key.contentType !== 'array'
	// );
	return {
		leafKeys: keys.filter((key) => key.contentType !== 'object' && key.contentType !== 'array'),
		objectKeys: keys.filter((key) => key.contentType === 'object'),
		arrayKeys: keys.filter((key) => key.contentType === 'array')
	};
}

export type Table = {
	columns: string[];
	rows: {
		[key: string]: string | number | boolean | null;
	}[];
};

export function createTableFromFields(
	fields: Field[],
	includeKeys: {
		key: string;
		format?: (value: string | number | boolean | null) => string | number | boolean | null;
	}[] = []
): Table {
	const rows = [];
	const getIndexRegex = /\[(\d+)\]/;
	const calculatePath = (key: string) => {
		// Split the key by the above regex
		const splitKey = key.split(getIndexRegex);
		const parts = splitKey
			.map((part) => {
				// If the part is a number, return it as a number
				if (!isNaN(Number(part))) return Number(part);
				// Otherwise, return it as a string (removed trailing and leading dots)
				return part.replace(/^\./, '').replace(/\.$/, '');
			})
			.reduce(
				(acc, part, index, arr) => {
					// If the part is a number, it is an index
					if (typeof part === 'number') return acc;
					if (arr[index + 1] === undefined) return acc;
					const key = part as string;
					acc[key] = arr[index + 1] as number;
					return acc;
				},
				{} as { [key: string]: number }
			);
		return Object.entries(parts)
			.map(([key, index]) => `${key}.[${index}]`)
			.join('.');
	};

	// Find all fields that are arrays
	const arrayFields = fields.map(({ key, unindexed, ancestorArrayKeys, value }) => {
		const path = calculatePath(key);
		return {
			key,
			unindexed,
			value,
			ancestorArrayKeys,
			path
		};
	});

	// Find all duplicate paths
	const pathCounts = arrayFields.reduce(
		(acc, { path }) => {
			acc[path] = (acc[path] || 0) + 1;
			return acc;
		},
		{} as { [path: string]: number }
	);

	const findChildren = (path: string) => {
		return arrayFields.filter(({ path: p }) => p.startsWith(path) && p !== path);
	};

	const duplicates = Object.entries(pathCounts)
		.map(([path, count]) => {
			const children = findChildren(path);
			return {
				path,
				count,
				children
			};
		})
		.filter(({ children }) => children.length > 0)
		.map(({ path }) => {
			return path;
		});

	// Remove duplicates from the arrayFields.
	const remainingFields = arrayFields.filter(({ path }) => {
		return !duplicates.includes(path);
	});
	const leafNodeKeys = remainingFields
		.map(({ path }) => path)
		.reduce((acc, path) => {
			acc.add(path);
			return acc;
		}, new Set<string>());

	// Building the rows ----------------

	const keyLookupTable = fields.reduce(
		(acc, field) => {
			acc[field.key] = field.value ?? null;
			return acc;
		},
		{} as { [key: string]: string | number | boolean | null }
	);

	// const selectedKeys = Object.entries(keys)
	// 	.filter(([key, value]) => value)
	// 	.map(([key]) => key);

	rows.push(
		...leafNodeKeys.values().map((leafKey) => {
			const row = includeKeys.reduce(
				(acc, unindexedKey) => {
					// Convert the selected key (unindexed) to an actual key by replacing
					// the unindexed key with the leaf node key.
					// For example, if:
					// leafKey = enrichment.meta_adlibrary_scrape.candidates.[1].data.snapshot.videos.[0]
					// unindexedKey = enrichment.meta_adlibrary_scrape.candidates.data.snapshot.videos.video_sd_url
					// Then:
					// key = enrichment.meta_adlibrary_scrape.candidates.[0].data.snapshot.videos.[0].video_sd_url
					// Find the location of the indices
					const regex = /\.?(\w|.*?)\.\[(\d+)\]/gm;
					const reindexMap = leafKey.matchAll(regex).reduce(
						(acc, match) => {
							const [, key, index] = match;
							acc[key] = `${key}.[${index}]` as string;
							return acc;
						},
						{} as { [key: string]: string }
					);
					// Replace the unindexed key with the leaf node key
					let key = unindexedKey.key;
					Object.entries(reindexMap).forEach(([k, value]) => {
						key = key.replace(k, value);
					});
					acc[unindexedKey.key] = unindexedKey.format
						? unindexedKey.format(keyLookupTable[key])
						: keyLookupTable[key];
					return acc;
				},
				{} as {
					[key: string]: string | number | boolean | null;
				}
			);
			return row;
		})
	);

	// Row building complete ------------

	return {
		columns: includeKeys.map(({ key }) => key),
		rows
	};
}

export async function tabulateObject(
	input: InputData,
	include: {
		key: string;
		format?: (value: string | number | boolean | null) => string | number | boolean | null;
	}[] = []
): Promise<Table> {
	// const fields = getFields(input);
	// // const selectedFields = fields.leafKeys.filter(({ unindexed }) =>
	// // 	includeKeys ? includeKeys.map(({ key }) => key).includes(unindexed) : true
	// // );
	// const selectedFields =
	// 	include.length > 0
	// 		? fields.leafKeys.filter(({ unindexed }) => include.map(({ key }) => key).includes(unindexed))
	// 		: fields.leafKeys;
	// const table = createTableFromFields(selectedFields, include);
	// return table;
	return new Promise((resolve) => {
		const fields = getFields(input);
		const selectedFields =
			include.length > 0
				? fields.leafKeys.filter(({ unindexed }) =>
						include.map(({ key }) => key).includes(unindexed)
					)
				: fields.leafKeys;
		const table = createTableFromFields(selectedFields, include);
		resolve(table);
	});
}

export function toCsv(table: {
	columns: string[];
	rows: {
		[key: string]: string | number | boolean | null;
	}[];
}) {
	const header = table.columns.join(',');
	const rows = table.rows
		.map((row) => {
			return table.columns
				.map((column) => {
					return row[column];
				})
				.join(',');
		})
		.join('\n');
	return `${header}\n${rows}`;
}

// Example usage:
const input = {
	address: {
		street: '123 Imaginary St',
		city: 'Anytown',
		state: 'QLD',
		zip: '4099'
	},
	people: [
		{
			name: 'Alice',
			age: 30,
			city: 'New York',
			pets: [
				{
					name: 'Fluffy',
					type: 'cat'
				},
				{
					name: 'Fido',
					type: 'dog'
				}
			]
		},
		{
			name: 'Bob',
			age: 40,
			city: 'Los Angeles',
			pets: [
				{
					name: 'Spot',
					type: 'dog'
				}
			]
		}
	]
};

console.log(getFields({ a: { b: 1, c: { d: [{ e: 3 }, { e: 4, f: 5 }] } } }));
console.log(getFields(input));
