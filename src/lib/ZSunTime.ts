/**
 * 真太阳时计算
 * 算法参考请见： https://github.com/hkargv/paipan
 */
export class ZSunTime{
    private _yy: number;
    private _mm: number;
    private _dd: number;
    private _hh: number;
    private _mt: number;
    private _ss: number;
    private _jj: number;
    private _ww: number;
    
    /**
     * 获取原始时间值
     */
    public getOriginDate: Date;
    /**
     * 获取真太阳时值(Date)
     */
    public getTimeDate: Date;
    /**
     * 获取真太阳时值(number[6])
     */
    public getTimeArray: number[]
    /**
     * 获取真太阳时值(yyyy-MM-dd hh:mm:ss)
     */
    public getTimeString: string;

    /**
     * 标准时间发出地经度(角度表示,东经为正西经为负),北京时间的经度为+120度0分
     */
    private Jstandar = 120;

    /**
    真太阳时计算位置初始化(经纬度: 113.280637,23.125188)
    @parame _jj      经度(标准时间发出地经度(角度表示,东经为正西经为负),北京时间的经度为+120度0分)
    @parame _ww      纬(角度表示,北纬为正南纬为负)
    */
    constructor(_jj:number=0, _ww:number=0){
        this._jj = _jj;
        this._ww = _ww;
    }
    /**
     * 
     * @param _yyyy 年
     * @param _mm 月
     * @param _dd 日
     * @param _hh 时
     * @param _mt 分
     * @param _ss 秒
     */
    public CalculateFrom(_yyyy:number, _mm:number, _dd:number, _hh:number, _mt:number, _ss:number):ZSunTime{
        this._yy=_yyyy;
        this._mm =_mm;
        this._dd =_dd;
        this._hh = _hh;
        this._mt = _mt;
        this._ss = _ss;
        if(Date.parse(_yyyy+'/'+_mm+'/'+_dd+' '+_hh+':'+_mt+':'+_ss)){
            this.getOriginDate = new Date(_yyyy,_mm,_dd,_hh,_mt,_ss);
            this.init();
        }else{
            throw new Error('时间数据参数格式错误(2000,12,31,23,59,59)，请检查!');
        }
        return this;
    }

    public CalculateFromDate(_date: Date):ZSunTime{
        if(_date){
            this._yy=_date.getFullYear();
            this._mm =_date.getMonth()+1;
            this._dd =_date.getDate();
            this._hh = _date.getHours();
            this._mt = _date.getMinutes();
            this._ss = _date.getSeconds();
            this.init();
        }else{
            throw new Error('_date入参不能为空!');
        }
        return this;
    }

    /**
     * 设置当前经度值
     * @param val 经度值
     */
    public setLongitude(val: number){
        this._jj = val;
    }
    /**
     * 设置当前纬度值
     * @param val 纬度值
     */
    public setLatitude(val: number){
        this._ww = val;
    }

    private intval(mixedVar: any, base: number=0):number {
        var tmp, match;
        var type = typeof mixedVar;
        if (type === 'boolean') {
            return +mixedVar;
        } else if (type === 'string') {
            if (base === 0) {
                match = mixedVar.match(/^\s*0(x?)/i);
                base = match ? (match[1] ? 16 : 8) : 10;
            }
            tmp = parseInt(mixedVar, base || 10);
            if (isNaN(tmp) || !isFinite(tmp)) {
                return 0;
            }
            return tmp;
        } else if (type === 'number' && isFinite(mixedVar)) {
            return mixedVar < 0 ? Math.ceil(mixedVar) : Math.floor(mixedVar);
        } else {
            return 0;
        }
    };
    private floatval(mixedVar: any): number{
        return (parseFloat(mixedVar) || 0);
    };

    /**
     * 將公历時间轉换爲儒略日
     * @param int yy(-1000-3000)
     * @param int mm(1-12)
     * @param int dd(1-31)
     * @param int hh(0-23)
     * @param int mt(0-59)
     * @param int ss(0-59)
     * @return false|number
     */
    private Jdays(yy:number, mm:number, dd:number, hh:number, mt:number, ss:number):number {
        var yy = this.floatval(yy);
        var mm = this.floatval(mm);
        var dd = this.floatval(dd);
        var hh = (hh === undefined) ? 12 : this.floatval(hh);
        var mt = (mt === undefined) ? 0 : this.floatval(mt);
        var ss = (ss === undefined) ? 0 : this.floatval(ss);

        var yp = yy + Math.floor((mm - 3) / 10);
        if ((yy > 1582) || (yy == 1582 && mm > 10) || (yy == 1582 && mm == 10 && dd >= 15)) {
            var init = 1721119.5;
            var jdy = Math.floor(yp * 365.25) - Math.floor(yp / 100) + Math.floor(yp / 400);
        } else {
            if ((yy < 1582) || (yy == 1582 && mm < 10) || (yy == 1582 && mm == 10 && dd <= 4)) {
                var init = 1721117.5;
                var jdy = Math.floor(yp * 365.25);
            } else { //不存在的时间
                return 0;
            }
        }
        var mp = Math.floor(mm + 9) % 12;
        var jdm = mp * 30 + Math.floor((mp + 1) * 34 / 57);
        var jdd = dd - 1;
        hh = hh + ((ss / 60) + mt) / 60;
        var jdh = hh / 24;
        return jdy + jdm + jdd + jdh + init;
    };

    /**
     * 將儒略日轉换爲公历(即陽曆或格里曆)年月日時分秒 [年,月,日,时,分,秒]
     * @param float jd
     * @return array
     */
    private Jtime(jd:number):Array<number> {
        var jd = this.floatval(jd);
        if (jd >= 2299160.5) { //以1582年的10月15日0時(JD值2299160.5)為分界點,在這之前為儒略曆,之後為格里曆
            var y4h = 146097;
            var init = 1721119.5;
        } else {
            var y4h = 146100;
            var init = 1721117.5;
        }
        var jdr = Math.floor(jd - init);
        var yh = y4h / 4;
        var cen = Math.floor((jdr + 0.75) / yh);
        var d = Math.floor(jdr + 0.75 - cen * yh);
        var ywl = 1461 / 4;
        var jy = Math.floor((d + 0.75) / ywl);
        d = Math.floor(d + 0.75 - ywl * jy + 1);
        var ml = 153 / 5;
        var mp = Math.floor((d - 0.5) / ml);
        d = Math.floor((d - 0.5) - 30.6 * mp + 1);
        var y = (100 * cen) + jy;
        var m = (mp + 2) % 12 + 1;
        if (m < 3) {
            y = y + 1;
        }
        var sd = Math.floor((jd + 0.5 - Math.floor(jd + 0.5)) * 24 * 60 * 60 + 0.00005);
        var mt = Math.floor(sd / 60);
        var ss = sd % 60;
        var hh = Math.floor(mt / 60);
        var mt = mt % 60;
        var yy = Math.floor(y);
        var mm = Math.floor(m);
        var dd = Math.floor(d);
        return [yy, mm, dd, hh, mt, ss];
    };

    private init():void{
        let y = this.intval(this._yy);
        let m = this.intval(this._mm);
        let d = this.intval(this._dd);
        let h = this.intval(this._hh);
        let mt = (this._mt === undefined) ? 0 : this.intval(this._mt);
        let s = (this._ss === undefined) ? 0 : this.intval(this._ss);
        let spcjd = this.Jdays(y, m, d, h, mt, s);
        if(this._jj && spcjd){
            //计算地方平太阳时,每经度时差4分钟
            let _suntime = spcjd - (this.Jstandar - this.floatval(this._jj)) * 4 / 60 / 24;
            let st = this.Jtime(_suntime);
            if(st && st.length==6){
                this.getTimeArray = st;
                this.getTimeDate = new Date(st[0],st[1],st[2],st[3],st[4],st[5]);
                this.getTimeString = st[0].toString()+'-'+st[1].toString()+'-'+st[2].toString()+' '+st[3].toString()+':'+st[4].toString()+':'+st[5].toString();
            }
        }
    }

  }