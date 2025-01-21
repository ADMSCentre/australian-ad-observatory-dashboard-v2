import { type Query, getMethodType, getMethodByValue } from '../const';

export default function treeToString(tree: Query): string {
	if (typeof tree === 'string') {
		return `"${tree}"`;
	}
	if (typeof tree === 'object') {
		const method = tree.method;
		const args = tree.args;
		if (getMethodType(method) === 'binary') {
			const left = args[0] as Query;
			const right = args[1] as Query;
			const queryStr = `${treeToString(left)} ${method} ${treeToString(right)}`;
			return `(${queryStr})`;
		}
		if (getMethodType(method) === 'unary') {
			const operand = args[0] as Query;
			return `${method} ${treeToString(operand)}`;
		}
		if (getMethodType(method) === 'function') {
			return `${method}(${(args as Query[]).map(treeToString).join(', ')})`;
		}
	}
	return '';
}

export const queryToString = (query: Query): string => {
	return treeToString(query).replace(/^\((.*)\)$/, '$1');
};

function parseString(token: string): string {
	return token.replace(/^"|"$/g, '');
}

function isValue(token: string): boolean {
	// Ignore operators
	if (isBinaryOp(token) || isUnaryOp(token) || isFunction(token)) {
		return false;
	}
	// Numbers are values
	if (!isNaN(Number(token))) {
		return true;
	}
	// Strings are values
	if (token.match(/".*"/)) {
		return true;
	}
	// Parentheses are also considered values (for variable-length arguments)
	if (token === '(' || token === ')') {
		return true;
	}
	return false;
}

function isFunction(token: string): boolean {
	return getMethodType(token) === 'function';
}

function isUnaryOp(token: string): boolean {
	return getMethodType(token) === 'unary';
}

function isBinaryOp(token: string): boolean {
	return getMethodType(token) === 'binary';
}

function isComma(token: string): boolean {
	return token === ',';
}

function isLeftParenthesis(token: string): boolean {
	return token === '(';
}

function isRightParenthesis(token: string): boolean {
	return token === ')';
}

function hasGreaterPrecedence(op1Name: string, op2Name: string): boolean {
	const op1 = getMethodByValue(op1Name);
	const op2 = getMethodByValue(op2Name);
	return (
		op1.precedence > op2.precedence ||
		(op1.precedence === op2.precedence && op1.associativity === 'left')
	);
}

export function shuntingYard(expression: string): string[] {
	const tokens =
		expression.match(/\(|\)|"[^"]*"|\w+|AND|OR|NOT|EXACT MATCH|MATCH/g)?.map((token) => token) ||
		[];
	// ?.map((token) => token.replace(/^"|"$/g, '')) || [];
	const outputQueue: string[] = [];
	const operatorStack: string[] = [];

	while (tokens.length > 0) {
		const token = tokens.shift()!;
		if (isValue(token)) {
			outputQueue.push(token);
		}
		if (isFunction(token)) {
			operatorStack.push(token);
		}
		if (isUnaryOp(token)) {
			if (tokens.length === 0) throw new Error(`Expected argument after ${token}`);
			operatorStack.push(token);
		}
		if (isBinaryOp(token)) {
			while (
				operatorStack.length > 0 &&
				operatorStack.at(-1)! !== '(' &&
				hasGreaterPrecedence(operatorStack.at(-1)!, token)
			) {
				outputQueue.push(operatorStack.pop()!);
			}
			operatorStack.push(token);
		}
		if (isComma(token)) {
			while (operatorStack.at(-1)! !== '(') {
				outputQueue.push(operatorStack.pop()!);
			}
		}
		if (isLeftParenthesis(token)) {
			operatorStack.push(token);
		}
		if (isRightParenthesis(token)) {
			while (operatorStack.length > 0 && operatorStack.at(-1)! !== '(') {
				if (operatorStack.length === 0) throw new Error('Mismatched parentheses');
				outputQueue.push(operatorStack.pop()!);
			}
			if (operatorStack.length === 0) throw new Error('Mismatched parentheses');
			operatorStack.pop();
			if (operatorStack.length > 0 && isFunction(operatorStack.at(-1)!)) {
				outputQueue.push(operatorStack.pop()!);
			}
		}
	}

	while (operatorStack.length > 0) {
		if (operatorStack.at(-1)! === '(') throw new Error('Mismatched parentheses');
		outputQueue.push(operatorStack.pop()!);
	}

	return outputQueue;
}

export function buildTree(queryStr: string): Query {
	const outputQueue = shuntingYard(queryStr);
	// console.log(outputQueue);
	const stack: (Query | string)[] = [];
	console.log(outputQueue);
	while (outputQueue.length > 0) {
		// console.log(stack, outputQueue);
		const token = outputQueue.shift();
		if (!token) break;
		if (isFunction(token) || isBinaryOp(token) || isUnaryOp(token)) {
			// console.log(stack, token);
			console.log('Function found');
			console.log(structuredClone(stack), structuredClone(token));
		}
		if (isUnaryOp(token)) {
			let arg = stack.pop()!;
			let numParentheses = 0;
			while (isRightParenthesis(arg as string)) {
				arg = stack.pop()!;
				numParentheses++;
			}
			for (let i = 0; i < numParentheses; i++) {
				const left = stack.pop();
				if (left !== '(' && left !== undefined) {
					stack.push(left!);
				}
			}
			if (!arg) throw new Error('Expected argument after unary operator');
			if (typeof arg !== 'object') throw new Error('Expected argument to be a query');
			stack.push({
				method: token,
				args: [arg]
			});
		}
		if (isBinaryOp(token)) {
			let right = stack.pop()!;
			while (isRightParenthesis(right as string)) {
				right = stack.pop()!;
			}
			let left = stack.pop()!;
			while (left === '(' && left !== undefined) {
				left = stack.pop()!;
			}
			if (!left || !right) throw new Error('Expected two arguments for binary operator');
			if (typeof left !== 'object' || typeof right !== 'object') {
				throw new Error('Expected arguments to be queries');
			}
			stack.push({
				method: token,
				args: [left, right]
			});
		}
		if (isValue(token)) {
			stack.push(parseString(token));
		}
		if (isFunction(token)) {
			const args: (Query | string)[] = [];
			if (stack.pop() !== ')') throw new Error('Mismatched parentheses');
			while (stack[stack.length - 1] !== '(') {
				args.unshift(stack.pop()!);
			}
			if (stack.pop() !== '(') throw new Error('Mismatched parentheses');
			stack.push({
				method: token,
				args: args
			});
		}
	}
	console.log(stack);
	const indexOfQuery = stack.findIndex((item) => typeof item === 'object');
	if (indexOfQuery === -1) {
		console.error(stack);
		throw new Error('Invalid query');
	}
	return stack[indexOfQuery] as Query;
	// if (typeof stack[0] !== 'object') throw new Error('Invalid query');
	// return stack[0] as Query;
}
