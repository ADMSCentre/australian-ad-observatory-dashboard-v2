// export const unaryOperators = ['NOT'];
// export const binaryOperators = ['AND', 'OR'];
// export const functions = ['MATCH', 'EXACT MATCH'];

export type MethodType = 'unary' | 'binary' | 'function' | 'unknown';

export type Method = {
	label: string;
	value: string;
	type: MethodType;
	precedence: number;
	associativity: 'left' | 'right';
	inputType?: 'datetime' | 'multi-text';
};

export type Query = {
	method: MethodValue;
	args: (Query | string)[];
};

export const METHODS = {
	AND: {
		label: 'AND',
		value: 'AND',
		type: 'binary',
		precedence: 2,
		associativity: 'left'
	},
	OR: {
		label: 'OR',
		value: 'OR',
		type: 'binary',
		precedence: 1,
		associativity: 'left'
	},
	NOT: {
		label: 'NOT',
		value: 'NOT',
		type: 'unary',
		precedence: 3,
		associativity: 'right'
	},
	ANYTHING_CONTAINS: {
		label: 'ANYTHING CONTAINS',
		value: 'ANYTHING_CONTAINS',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	},
	DATETIME_AFTER: {
		label: 'TIME AFTER',
		value: 'DATETIME_AFTER',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'datetime'
	},
	DATETIME_BEFORE: {
		label: 'TIME BEFORE',
		value: 'DATETIME_BEFORE',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'datetime'
	},
	OBSERVER_ID_CONTAINS: {
		label: 'ACTIVATION CODE CONTAINS',
		value: 'OBSERVER_ID_CONTAINS',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	},
	OBSERVATION_ID_CONTAINS: {
		label: 'OBSERVATION ID CONTAINS',
		value: 'OBSERVATION_ID_CONTAINS',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	},
	CATEGORIES_CONTAINS: {
		label: 'CATEGORIES CONTAINS',
		value: 'CATEGORIES_CONTAINS',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	},
	PAGE_NAME_CONTAINS: {
		label: 'PAGE NAME CONTAINS',
		value: 'PAGE_NAME_CONTAINS',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	},
	REFERENCE_QUERY: {
		label: 'REFERENCE QUERY',
		value: 'REFERENCE_QUERY',
		type: 'function',
		precedence: 4,
		associativity: 'right',
		inputType: 'multi-text'
	}
} as const;

export type MethodValue = keyof typeof METHODS;

export const DEFAULT_QUERY: Query = {
	method: 'ANYTHING_CONTAINS',
	args: []
};

// export const AND: Method = {
// 	label: 'AND',
// 	value: 'AND',
// 	type: 'binary',
// 	precedence: 2,
// 	associativity: 'left'
// };

// export const OR: Method = {
// 	label: 'OR',
// 	value: 'OR',
// 	type: 'binary',
// 	precedence: 1,
// 	associativity: 'left'
// };

// export const NOT: Method = {
// 	label: 'NOT',
// 	value: 'NOT',
// 	type: 'unary',
// 	precedence: 3,
// 	associativity: 'right'
// };

// export const MATCH: Method = {
// 	label: 'MATCH',
// 	value: 'MATCH',
// 	type: 'function',
// 	precedence: 4,
// 	associativity: 'right'
// };

// export const EXACT_MATCH: Method = {
// 	label: 'EXACT MATCH',
// 	value: 'EXACT MATCH',
// 	type: 'function',
// 	precedence: 4,
// 	associativity: 'right'
// };

export const getMethodType = (methodValue: MethodValue): MethodType => {
	// if (methodValue === AND.value || methodValue === OR.value) {
	// 	return 'binary';
	// } else if (methodValue === NOT.value) {
	// 	return 'unary';
	// } else if (methodValue === MATCH.value || methodValue === EXACT_MATCH.value) {
	// 	return 'function';
	// }
	// return 'unknown';
	if (METHODS[methodValue]) return METHODS[methodValue].type;
	return 'unknown';
};

export const getMethodByValue = (value: MethodValue): Method => {
	if (METHODS[value]) return METHODS[value];
	throw new Error(`Method with value ${value} not found`);
};
