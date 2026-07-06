import type { Token } from './types';
import { DIGIT_TOKENS } from './types';
import { makeInvalidEvaluationResult, makeValidEvaluationResult } from './result';
import type { EvaluationResult } from './result';

/**
 * Equadle expression language
 * ===========================
 *
 * This file parses only the left side of an equation.
 * A complete equation has the form:
 *
 * <equation> ::= <exp> = <number>                 / Equation(exp: Exp, expected: number)
 *
 * The right side is a plain non-negative integer, not a full expression.
 *
 * -----------------------------------------------------------------------------
 * Concrete syntax                                 / Abstract syntax
 * -----------------------------------------------------------------------------
 *
 * <exp>        ::= <num-exp>                      / NumExp
 *                | <add-exp>                      / | AddExp
 *                | <sub-exp>                      / | SubExp
 *                | <mul-exp>                      / | MulExp
 *                | <div-exp>                      / | DivExp
 *                | <square-exp>                   / | SquareExp
 *                | <paren-exp>                    / | Exp
 *
 * <num-exp>    ::= <number>                       / NumExp(value: number)
 *
 * <add-exp>    ::= <exp> + <term>                 / AddExp(left: Exp, right: Exp)
 * <sub-exp>    ::= <exp> - <term>                 / SubExp(left: Exp, right: Exp)
 *
 * <mul-exp>    ::= <term> * <factor>              / MulExp(left: Exp, right: Exp)
 * <div-exp>    ::= <term> / <factor>              / DivExp(left: Exp, right: Exp)
 *
 * <square-exp> ::= <base> ^2                      / SquareExp(exp: Exp)
 * <paren-exp>  ::= ( <exp> )                      / returns inner Exp
 *
 * <term>       ::= <factor>                       / Exp
 *                | <mul-exp>                      / | MulExp
 *                | <div-exp>                      / | DivExp
 *
 * <factor>     ::= <base>                         / Exp
 *                | <square-exp>                   / | SquareExp
 *
 * <base>       ::= <num-exp>                      / NumExp
 *                | <paren-exp>                    / | Exp
 *
 * <number>     ::= <digit>+                       / number
 * <digit>      ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 *
 * -----------------------------------------------------------------------------
 * Abstract syntax definitions
 * -----------------------------------------------------------------------------
 *
 * Equation(exp: Exp, expected: number)
 *
 * Exp ::= NumExp(value: number)
 *       | AddExp(left: Exp, right: Exp)
 *       | SubExp(left: Exp, right: Exp)
 *       | MulExp(left: Exp, right: Exp)
 *       | DivExp(left: Exp, right: Exp)
 *       | SquareExp(exp: Exp)
 *
 * -----------------------------------------------------------------------------
 * Important notes
 * -----------------------------------------------------------------------------
 *
 * 1. <paren-exp> has no AST constructor.
 *    Parentheses only change parsing order. The AST keeps the inner expression.
 *
 * 2. <term>, <factor>, and <base> are precedence levels, not real AST nodes.
 *    They help define the grammar, but the final AST contains only Exp nodes.
 *
 * 3. This grammar is good documentation, but it is left-recursive:
 *
 *        <add-exp> ::= <exp> + <term>
 *        <sub-exp> ::= <exp> - <term>
 *        <mul-exp> ::= <term> * <factor>
 *        <div-exp> ::= <term> / <factor>
 *
 *    Therefore, we should not implement it directly with naive recursive descent.
 *    The implementation will use an equivalent non-left-recursive parser grammar
 *    and fold the helper tails into the same AST constructors.
 *
 * 4. Precedence, from strongest to weakest:
 *
 *        parentheses
 *        square
 *        multiplication / division
 *        addition / subtraction
 *
 * 5. Binary operators are left-associative:
 *
 *        12-3-4
 *
 *    is parsed as:
 *
 *        SubExp(SubExp(NumExp(12), NumExp(3)), NumExp(4))
 *
 * -----------------------------------------------------------------------------
 * Semantic restrictions
 * -----------------------------------------------------------------------------
 *
 * These restrictions are not part of the context-free grammar itself.
 * They should be checked after parsing or during evaluation:
 *
 * - Division by 0 is not allowed.
 * - The evaluated left side must equal the number on the right side.
 * - Multi-digit numbers cannot start with 0.
 * - On the left side, 0 cannot appear as a standalone number.
 */
