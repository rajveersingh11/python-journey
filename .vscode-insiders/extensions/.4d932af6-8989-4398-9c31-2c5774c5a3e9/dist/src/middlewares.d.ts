import { Middleware } from 'vscode-languageclient';
/**
 * Reference-like code lens require a client command to be executed.
 * There isn't a way to request client to show references from the server.
 * If other clients want to show references, they need to have a similar middleware to resolve the code lens.
 */
export declare const resolveCodeLensMiddleware: Middleware['resolveCodeLens'];
