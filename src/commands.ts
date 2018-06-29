import * as vscode from 'vscode';
import {fileops} from './fileops';
import {remote} from './remote';
import {local} from './local';
import * as ui from './ui';
import {configure} from './configure';

export function upload(context: vscode.ExtensionContext)
{
    return async ()=>
    {
        let conf:configure = new configure();
        let local_path:string = conf.localPath;
        let remote_path:string = conf.remotePath;
        let r = new remote({
            host: conf.ipv4addr,
            port: conf.port,
            username: conf.username,
            password: conf.password
        });
        let l = new local();
        let f = new fileops();

        const panel = vscode.window.createWebviewPanel('uploadList','upload list',vscode.ViewColumn.One,{enableScripts: true});
        panel.webview.html = "loading";

        let diffInfos = await f.get_file_diff_infos(r,l,remote_path,local_path);
        panel.webview.html = ui.read_panel(diffInfos);

        let message:any = await new Promise((resolve)=>
        {
            panel.webview.onDidReceiveMessage((message)=>
            {
                resolve(message);
            });
        });

        let localFiles = new Array<string>();
        let remoteFiles = new Array<string>();
        switch(message.command)
        {
            case 'upload':
            for(let i = 0; i < message.selected_list.length; ++i)
            {
                let index:number = message.selected_list[i];
                localFiles.push(diffInfos[index].local_name);
                remoteFiles.push(diffInfos[index].remote_name);
            }
            await f.sync_files_to_remote(r, localFiles, remoteFiles);
            panel.webview.html = "upload complete";
        }
    };
}