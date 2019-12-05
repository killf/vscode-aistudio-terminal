import * as vscode from 'vscode';
import { Terminal } from './terminal';
import { Buffer } from 'buffer';
import * as stringRandom from 'string-random';

let global_context: vscode.ExtensionContext;
let global_shellId: number = 1;

async function setCookie() {
	let cookie = await vscode.window.showInputBox({ prompt: "Set Cookie for AIStudio." });
	if (cookie) {
		let ss = cookie.split(/\s+|-|=/);
		if (ss.length > 4) {
			let userId = ss[2];
			let projectId = ss[3];

			vscode.workspace.getConfiguration().update("cookie", cookie);
			vscode.workspace.getConfiguration().update("userId", userId);
			vscode.workspace.getConfiguration().update("projectId", projectId);

			let shellId = vscode.workspace.getConfiguration().get<number>("shellId", -1);
			vscode.workspace.getConfiguration().update("shellId", shellId);
		}
	}
}

async function openTerminal() {
	/*1.参数检查*/
	let cookie = vscode.workspace.getConfiguration().get<string>("cookie");
	let userId = vscode.workspace.getConfiguration().get<string>("userId");
	let projectId = vscode.workspace.getConfiguration().get<string>("projectId");
	if (!(cookie && userId && projectId)) {
		let action = await vscode.window.showErrorMessage("请先设置cookie、userID和projectId！", "Set Cookie");
		if (action === "Set Cookie") {
			await vscode.commands.executeCommand("aistudio.setCookie");
		} 
		return;
	}

	/*2.打开shell*/
	let shellId = vscode.workspace.getConfiguration().get<number>("shellId", -1);
	if (shellId < 0) shellId = global_shellId++;

	let terminal = new Terminal();
	terminal.userId = userId;
	terminal.projectId = projectId;
	terminal.shellId = shellId;
	terminal.secKey = Buffer.from(stringRandom(20)).toString("base64");
	terminal.cookie = cookie;

	let handle = vscode.window.createTerminal({ name: `AIStudio Terminal ${terminal.shellId}`, pty: terminal });
	handle.show();
}

export function activate(context: vscode.ExtensionContext) {
	global_context = context;

	context.subscriptions.push(vscode.commands.registerCommand('aistudio.setCookie', setCookie));
	context.subscriptions.push(vscode.commands.registerCommand('aistudio.openTerminal', openTerminal));
}

export function deactivate() { }
