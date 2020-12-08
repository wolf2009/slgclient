/**武将(配置)*/
export class GeneralConfig {
    name: string = "";
    cfgId: number = 0;
    force: number = 0;
    strategy: number = 0;
    defense: number = 0;
    speed: number = 0;
    destroy: number = 0;
    cost: number = 0;

    force_grow: number = 0;
    strategy_grow: number = 0;
    defense_grow: number = 0;
    speed_grow: number = 0;
    destroy_grow: number = 0;
    physical_power_limit: number = 0;
    cost_physical_power: number = 0;

    star:number = 0;
    arms:number[] = [];

}

/**武将等级配置*/
export class GenaralLevelConfig {
    level: number = 0;
    exp: number = 0;
    soldiers: number = 0;
}

/**武将共有配置*/
export class GeneralCommonConfig {
    physical_power_limit: number = 100;
    cost_physical_power: number = 10;
    recovery_physical_power: number = 10;
    reclamation_time: number = 3600;
    draw_general_cost:number = 0;
}

/**武将数据*/
export class GeneralData {
    id: number = 0;
    cfgId: number = 0;
    cost: number = 0;
    exp: number = 0;
    level: number = 0;
    physical_power: number = 0;
    order:number = 0;
    star_lv:number = 0;
    parentId:number = 0;
    compose_type:number = 0;

    hasPrPoint:number = 0;
    usePrPoint:number = 0;
    force_added:number = 0;
    strategy_added:number = 0;
    defense_added:number = 0;
    speed_added:number = 0;
    destroy_added:number = 0;
    config:GeneralConfig = new GeneralConfig();

    public static createFromServer(serverData: any, generalData: GeneralData = null,generalCfg:GeneralConfig): GeneralData {
        let data: GeneralData = generalData;
        if (data == null) {
            data = new GeneralData();
        }
        data.id = serverData.id;
        data.cfgId = serverData.cfgId;
        data.cost = serverData.cost;
        data.exp = serverData.exp;
        data.level = serverData.level;
        data.order = serverData.order;
        data.physical_power = serverData.physical_power;
        data.star_lv = serverData.star_lv;
        data.parentId = serverData.parentId;
        data.compose_type = serverData.compose_type;

        data.hasPrPoint = serverData.hasPrPoint;
        data.usePrPoint = serverData.usePrPoint;
        data.force_added = serverData.force_added;
        data.strategy_added = serverData.strategy_added;
        data.defense_added = serverData.defense_added;
        data.speed_added = serverData.speed_added;
        data.destroy_added = serverData.destroy_added;
        data.config = generalCfg

        return data;
    }

    public static getPrStr(pr:number = 0,add:number = 0,lv:number = 0 ,grow:number = 0):string{
        return (pr + add)/100 + "+(" + lv * grow/100 + "%)";
    }
}

export default class GeneralProxy {
    //武将基础配置数据
    protected _generalConfigs: Map<number, GeneralConfig> = new Map<number, GeneralConfig>();
    protected _levelConfigs: GenaralLevelConfig[] = [];
    protected _commonConfig: GeneralCommonConfig = new GeneralCommonConfig();
    protected _generalTexs: Map<number, cc.SpriteFrame> = new Map<number, cc.SpriteFrame>();
    protected _myGenerals: Map<number, GeneralData> = new Map<number, GeneralData>();

    public clearData(): void {
        this._myGenerals.clear();
    }

    public initGeneralConfig(cfgs: any[], bCost: any): void {
        let cfgData: any = null;
        let levelData: any = null;
        for (let i: number = 0; i < cfgs.length; i++) {
            console
            if (cfgs[i]._name == "general") {
                cfgData = cfgs[i].json.list;
            } else if (cfgs[i]._name == "general_basic") {
                levelData = cfgs[i].json.levels;
            }
        }

        if (cfgData) {
            this._generalConfigs.clear();
            for (let i: number = 0; i < cfgData.length; i++) {
                var cfg: GeneralConfig = new GeneralConfig();
                cfg.cfgId = cfgData[i].cfgId;
                cfg.name = cfgData[i].name;
                cfg.force = cfgData[i].force;
                cfg.strategy = cfgData[i].strategy;
                cfg.defense = cfgData[i].defense;
                cfg.speed = cfgData[i].speed;
                cfg.destroy = cfgData[i].destroy;
                cfg.cost = cfgData[i].cost;

                cfg.force_grow = cfgData[i].force_grow;
                cfg.strategy_grow = cfgData[i].strategy_grow;
                cfg.defense_grow = cfgData[i].defense_grow;
                cfg.speed_grow = cfgData[i].speed_grow;
                cfg.destroy_grow = cfgData[i].destroy_grow;
                cfg.physical_power_limit = bCost.general.physical_power_limit;
                cfg.cost_physical_power = bCost.general.cost_physical_power;

                cfg.star = cfgData[i].star;
                cfg.arms = cfgData[i].arms;

                this._generalConfigs.set(cfg.cfgId, cfg);
            }
        }

        if (levelData) {
            this._levelConfigs.length = levelData.length;
            for (let i: number = 0; i < levelData.length; i++) {
                var levelCfg: GenaralLevelConfig = new GenaralLevelConfig();
                levelCfg.level = levelData[i].level;
                levelCfg.exp = levelData[i].exp;
                levelCfg.soldiers = levelData[i].soldiers;
                this._levelConfigs[levelCfg.level - 1] = levelCfg;
            }
        }

        this._commonConfig.physical_power_limit = bCost.general.physical_power_limit;
        this._commonConfig.cost_physical_power = bCost.general.cost_physical_power;
        this._commonConfig.recovery_physical_power = bCost.general.recovery_physical_power;
        this._commonConfig.reclamation_time = bCost.general.reclamation_time;
        this._commonConfig.draw_general_cost = bCost.general.draw_general_cost;
    }

    public initGeneralTex(texs: cc.SpriteFrame[]): void {
        this._generalTexs.clear();
        for (let i: number = 0; i < texs.length; i++) {
            let id: number = Number(String(texs[i].name).split("_")[1]);
            this._generalTexs.set(id, texs[i]);
        }
    }

    public updateMyGenerals(datas: any[]): void {
        for (var i = 0; i < datas.length; i++) {
            let data: GeneralData = GeneralData.createFromServer(datas[i],null,this._generalConfigs.get(datas[i].cfgId));
            this._myGenerals.set(data.id, data);
        }
    }

    public updateGenerals(datas: any): number[] {
        let ids: number[] = [];
        let data: GeneralData = GeneralData.createFromServer(datas, this._myGenerals.get(datas.id),this._generalConfigs.get(datas.cfgId));
        this._myGenerals.set(data.id, data);
        ids.push(data.id);
        return ids;
    }

    /**武将配置*/
    public getGeneralCfg(cfgId: number): GeneralConfig {
        if (this._generalConfigs.has(cfgId)) {
            return this._generalConfigs.get(cfgId);
        }
        return null;
    }

    /**武将等级配置*/
    public getGeneralLevelCfg(level: number): GenaralLevelConfig {
        if (level > 0 && level <= this._levelConfigs.length) {
            return this._levelConfigs[level - 1];
        }
        return null;
    }

    public getMaxLevel(): number {
        return this._levelConfigs.length;
    }

    /**武将头像素材*/
    public getGeneralTex(cfgId: number): cc.SpriteFrame {
        if (this._generalTexs.has(cfgId)) {
            return this._generalTexs.get(cfgId);
        }
        return null;
    }

    /**武将相关公有配置*/
    public getCommonCfg(): GeneralCommonConfig {
        return this._commonConfig;
    }

    /**我的武将列表*/
    public getMyGenerals(): GeneralData[] {
        return Array.from(this._myGenerals.values());
    }

    /**我的武将*/
    public getMyGeneral(id: number): GeneralData {
        if (this._myGenerals.has(id)) {
            return this._myGenerals.get(id);
        }
        return null;
    }


    /**相同类型的武将id */
    public getGeneralIds(cfgId: number):number[]{
        let myGenerals:GeneralData[] = this.getMyGenerals();
        let tempGenerals:number[] = [];
        for(var i = 0;i < myGenerals.length; i++){
            if(myGenerals[i].cfgId == cfgId){
                tempGenerals.push(myGenerals[i].id)
            }
        }
        return tempGenerals;
    }


    protected sortStar(a:GeneralData,b:GeneralData):number{
        if(a.config.star > b.config.star){
            return 1;
        }

        return -1;
    }
    /**
     * 排序 已经使用的
     */
    public getUseGenerals():GeneralData[] {
        var tempArr:GeneralData[] = this.getMyGenerals().concat();
        tempArr.sort(this.sortStar);
        var temp:GeneralData[]  = [];

        for(var i = 0; i < tempArr.length ;i++){
            if(tempArr[i].order > 0){
                temp.push(tempArr[i]);
                tempArr.splice(i,1);
                i--;
            }
        }


        for(var i = 0; i < tempArr.length ;i++){
            if(tempArr[i].parentId > 0){
                tempArr.splice(i,1);
                i--;
            }
        }


        temp = temp.concat(tempArr);

        return temp;
    }

    public getComposeGenerals(cfgId:number = 0,id:number = 0):GeneralData[]{
        var temp:GeneralData[]  = [];
        var tempArr:GeneralData[] = this.getMyGenerals().concat();

        for(var i = 0; i < tempArr.length ;i++){
            if(tempArr[i].order > 0 || tempArr[i].id == id || tempArr[i].cfgId != cfgId || tempArr[i].parentId > 0){
                continue
            }

            temp.push(tempArr[i]);
        }

        return temp;
    }
}