class IconInfo { //공통 정보
    public remainCount: number = 0;
    constructor(
      public iconId: number,
      public maxCount: number,
      public blockdSameDisplay: boolean = false,
      public iconFixposition: number = -1,
      public stackCount: number = 1
    ) {
      this.remainCount = maxCount;
      if(iconFixposition >= 0 && maxCount != stackCount)
      {
        throw "1스택으로 존재할때만 fixposition이 작동합니다.";
      }
    }
  
    /**
     * IsSameIcon
     */
    public IsSameIcon(
      targetIcon: IconInfo,
      compareStack: boolean = false
    ): boolean {
      return (
        this.iconId === targetIcon.iconId &&
        (!compareStack || this.stackCount === targetIcon.stackCount)
      );
    }
    /**
     * IsSameIcon
     */
    public IsThisIcon(iconId: number, stackCount: number): boolean {
      return this.iconId === iconId && this.stackCount === stackCount;
    }
  }