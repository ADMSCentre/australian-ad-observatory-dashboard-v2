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
};

export type Query = {
	method: string;
	args: (Query | string)[];
};

export const AND: Method = {
	label: 'AND',
	value: 'AND',
	type: 'binary',
	precedence: 2,
	associativity: 'left'
};

export const OR: Method = {
	label: 'OR',
	value: 'OR',
	type: 'binary',
	precedence: 1,
	associativity: 'left'
};

export const NOT: Method = {
	label: 'NOT',
	value: 'NOT',
	type: 'unary',
	precedence: 3,
	associativity: 'right'
};

export const MATCH: Method = {
	label: 'MATCH',
	value: 'MATCH',
	type: 'function',
	precedence: 4,
	associativity: 'right'
};

export const EXACT_MATCH: Method = {
	label: 'EXACT MATCH',
	value: 'EXACT MATCH',
	type: 'function',
	precedence: 4,
	associativity: 'right'
};

export const getMethodType = (method: string): MethodType => {
	if (method === AND.value || method === OR.value) {
		return 'binary';
	} else if (method === NOT.value) {
		return 'unary';
	} else if (method === MATCH.value || method === EXACT_MATCH.value) {
		return 'function';
	}
	return 'unknown';
};

export const getMethodByValue = (value: string): Method => {
	switch (value) {
		case AND.value:
			return AND;
		case OR.value:
			return OR;
		case NOT.value:
			return NOT;
		case MATCH.value:
			return MATCH;
		case EXACT_MATCH.value:
			return EXACT_MATCH;
		default:
			throw new Error(`Method with value ${value} not found`);
	}
};
