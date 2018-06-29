import { readFileSync } from "fs";
import * as common from './common';
import { join } from "path";
import * as cheerio from 'cheerio';

import {fileDiffInfo} from './fileops';

function format_local_lost_file(info:fileDiffInfo, id:number):string
{
    return `<input type="checkbox" name="fileInfo" value="${id}">x<==${info.remote_name}</input><br/>`;
    
}

function format_remote_lost_file(info:fileDiffInfo, id:number):string
{
    return `<input type="checkbox" name="fileInfo" value="${id}">${info.local_name}==>x</input><br/>`;
}

function format_both_exist_file(info:fileDiffInfo, id:number):string
{
    return `<input type="checkbox" name="fileInfo" value="${id}" checked="checked">${info.local_name}==>${info.remote_name}</input><br/>`;
}

export function read_panel(info:fileDiffInfo[]):string
{
    let path:string = join(common.extension_path, 'src', 'ui', 'panel.html');
    const $ = cheerio.load(readFileSync(path).toString());
    for(let i = 0; i < info.length;++i)
    {
        let str:string = "";
        if(info[i].local_time===0 && info[i].remote_time===0)
        {
            throw new Error('error: file '+info[i].local_name+' don\'t have accurate modify time');
        }
        else if(info[i].local_time===0)
        {
            str = format_local_lost_file(info[i], i);
        }
        else if(info[i].remote_time===0)
        {
            str = format_remote_lost_file(info[i], i);
        }
        else
        {
            str = format_both_exist_file(info[i], i);
        }
        $("#list").append(str);
    }
    return $.html();
}