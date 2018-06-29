import * as vscode from 'vscode';
export var extension_name:string = 'remote-cdev-helper';
export var extension_publisher:string = 'mq';
export var extension_fullname:string = extension_publisher+'.'+extension_name;
var ext = vscode.extensions.getExtension(extension_fullname);
export var extension_path:string = ext===undefined?"":ext.extensionPath;
export var upload_name:string = "upload";
