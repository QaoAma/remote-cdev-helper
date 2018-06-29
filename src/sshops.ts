import * as ssh2 from "ssh2";

export class ssh2Ops
{
    private client:ssh2.Client;
    private isReady:boolean;
    constructor(config:ssh2.ConnectConfig)
    {
        this.client = new ssh2.Client();
        this.client.connect(config);
        this.isReady = false;
    }

    private async wait_for_ready()
    {
        if(this.isReady === false)
        {
            await new Promise((resolve)=>{
                this.client.on('ready',()=>resolve());
            });
            this.isReady = true;
        }
    }

    public async runCmd(cmd:string)
    {
        await this.wait_for_ready();
        let p:Promise<ssh2.ClientChannel> = new Promise((resolve, reject)=>{
            this.client.exec(cmd,(err,stream)=>{
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve(stream);
                }
            });
        });
        let stream:ssh2.ClientChannel = await p;
        let p1:Promise<string> = new Promise((resolve, reject)=>{
            stream.on('close',(code:number, signal:number)=>{
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            }).on('data',(data:any)=>resolve(data))
            .stderr.on('data',data=>reject(data));
            });
        let data = await p1;
        return data.toString();
    }

    private async get_stfp()
    {
        await this.wait_for_ready();
        return new Promise<ssh2.SFTPWrapper>((resolve, reject)=>
        {
            this.client.sftp((err,sftp)=>
            {
                if(err){reject(err);}
                else{resolve(sftp);}
            });
        });
    }

    public async upload_files(localFile:string, remoteFile:string) 
    {
        let sftp = await this.get_stfp();
        await new Promise((resolve, reject)=>
        {
            let onStep = (total_transferred:number, chunk:number, total:number)=>
            {
                if(total_transferred >= total)
                {
                    resolve();
                }
            };
            let option = {step: onStep};
            sftp.fastPut(localFile, remoteFile,option,(err)=>{
                if(err)
                {
                    reject(err);
                }
            });
        });
    }

    public async delete_remote_files(path:string)
    {
        let sftp = await this.get_stfp();
        await new Promise((resolve, reject)=>
        {
            sftp.unlink(path,(err)=>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    public async get_absolute_path(path:string)
    {
        let sftp = await this.get_stfp();
        return new Promise<string>((resolve, reject)=>
        {
            sftp.realpath(path,(err, absPath)=>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve(absPath);
                }
            });
        });
    }
}
