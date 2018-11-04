
class Icon {
    constructor(
      public iconInfo: IconInfo,
      public dataIndex: number,
      public reelIndex: number
    ) {}
    /**
     * IsSameIcon
     */
    public IsSameIcon(tartIcon: Icon) {
      return this.iconInfo.IsSameIcon(tartIcon.iconInfo, false);
    }
  }