import * as vscode from 'vscode';

export class configure
{
    public localPath:string;
    public remotePath:string;
    public username:string;
    public password:string;
    public ipv4addr:string;
    public port:number;

    private get_attr_from_configure(conf:vscode.WorkspaceConfiguration, attr:string):string
    {
        let tmp:any = conf.get(attr);
        if(tmp)
        {
            return tmp.toString();
        }
        else
        {
            return "";
        }
    }
    constructor()
    {
        let folder:any = vscode.workspace.workspaceFolders;
        let config = vscode.workspace.getConfiguration("upload");
        this.localPath = this.get_attr_from_configure(config,"localPath");
        this.remotePath = this.get_attr_from_configure(config, "remotePath");
        this.username = this.get_attr_from_configure(config,"username");
        this.password = this.get_attr_from_configure(config,"password");
        this.ipv4addr = this.get_attr_from_configure(config,"ipv4addr");
        this.port = Number(this.get_attr_from_configure(config,"port"));
    }
};