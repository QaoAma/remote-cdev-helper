'use strict';
import * as vscode from 'vscode';
import * as common from './common';
import * as commands from './commands';

export function activate(context: vscode.ExtensionContext) {
    
    let disposable = vscode.commands.registerCommand('extension.' + common.upload_name, commands.upload(context));
    context.subscriptions.push(disposable);
}

export function deactivate() {
}