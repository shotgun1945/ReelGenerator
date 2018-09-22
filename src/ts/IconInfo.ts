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