import {local} from './local';
import {remote} from './remote';

export interface fileInfo
{
    name:string;
    time:number;
}

export interface fileDiffInfo
{
    local_name:string;
    local_time:number;
    remote_name:string;
    remote_time:number;
};

export class fileops
{
    private delete_file_info_prefix_path_and_format(infos:fileInfo[], parent_dir:string)
    {
        infos.forEach(obj => {
            obj.name = obj.name.slice(parent_dir.length).replace(/\\/g,'/');
          });
        return infos;
    }
    
    private compare_file_infos(infos1:fileInfo[], infos2:fileInfo[], abs_path1:string, abs_path2:string)
    {
        let diffInfos = new Array<fileDiffInfo>();
        for(let i = 0; i < infos1.length; i++)
        {
            let info1 = infos1[i];
            for(let j = 0; j < infos2.length; j++)
            {
                if(infos2[j] !== undefined)
                {
                    if(info1.name === infos2[j].name)
                    {
                        if(info1.time > infos2[j].time)
                        {
                            diffInfos.push({
                                local_name : abs_path1+info1.name,
                                local_time : info1.time,
                                remote_name : abs_path2+infos2[j].name,
                                remote_time : infos2[j].time 
                            });
                        }
                        delete infos1[i];
                        delete infos2[j];
                        break;
                    }
                }
            }
        }
    
        infos1.forEach(obj=>{
            if(obj !== undefined)
            {
                diffInfos.push({
                    local_name : abs_path1+obj.name,
                    local_time : obj.time,
                    remote_name : "",
                    remote_time : 0
                });
            }
        });
        infos2.forEach(obj=>{
            if(obj !== undefined)
            {
                diffInfos.push({
                    local_name : "",
                    local_time : 0,
                    remote_name : abs_path2+obj.name,
                    remote_time : obj.time
                });
            }
        });
        return diffInfos;
    }
    
    public async get_file_diff_infos(remote:remote, local:local, remote_path:string, local_path:string):Promise<fileDiffInfo[]>
    {
        let remoteInfos = await remote.get_file_infos(remote_path);
        let remoteAbsPath = await remote.get_absolute_path(remote_path);
        let localAbsPath = local.get_absolute_path(local_path);
        let localInfos = local.get_file_infos(localAbsPath);
        this.delete_file_info_prefix_path_and_format(remoteInfos, remoteAbsPath);
        this.delete_file_info_prefix_path_and_format(localInfos, localAbsPath);
        return this.compare_file_infos(localInfos,remoteInfos, localAbsPath, remoteAbsPath);
    }
    
    private async sync_file_to_remote(remote:remote, local_path:string, remote_path:string)
    {
        if(remote_path === "")
        {
            throw new Error("remote path does not exist");
        }
        if(local_path === "")
        {
            return remote.delete_file(remote_path);
        }
        remote.send_file(remote_path, local_path);
    }

    public async sync_files_to_remote(remote:remote, local_files:string[], remote_files:string[])
    {
        if(local_files.length !== remote_files.length)
        {
            throw new Error("unexpected local files count or remote files count");
        }
        let results = new Array<Promise<void>>();
        for(let i = 0; i < local_files.length; ++i)
        {
            results.push(this.sync_file_to_remote(remote, local_files[i], remote_files[i]));
        }
        Promise.all(results);
    }
};

