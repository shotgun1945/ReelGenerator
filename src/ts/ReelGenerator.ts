var m_ReelCount = 0; // 릴 개수
// 릴 사이즈
// 아이콘 종류
// 릴별 아이콘 개수
var m_ReelDisplayHeight = 3;
function CheckWhile(
  whileCount: number,
  exception: string,
  RepeatFunction: Function,
  CheckFunc: Function
) {
  var whileRemainCount: number = whileCount;
  while (CheckFunc) {
    RepeatFunction();
    whileRemainCount--;
    if (whileRemainCount < 0) {
      break;
    }
    throw exception;
  }
}

function PrintIconArray(array: Array<Icon>): string {
  let resultString = "";
  array.forEach(element => {
    resultString += element.iconInfo.iconId + ", ";
  });
  return resultString;
}

function PrintIconInfoArray(array: Array<IconInfo>): string {
  let resultString = "";
  array.forEach(element => {
    resultString += element.iconId + ", ";
  });

  return resultString;
}

function main() {
  //TODO:TESTVALUE

  const reel = new Reel(0, 30);

  const iconInfo1 = new IconInfo(1, 1, true , 0);
  const iconInfo2 = new IconInfo(2, 5);
  const iconInfo3 = new IconInfo(3, 8, false, -1);
  const iconInfo4 = new IconInfo(4, 8, false, -1);
  const iconInfo5 = new IconInfo(5, 8, false, -1);
  const iconInfoArray = [iconInfo1, iconInfo2, iconInfo3, iconInfo4, iconInfo5];
  reel.setIconInfoArray(iconInfoArray);
  let result: Array<Icon> = reel.generator();
  console.log(PrintIconArray(result));
  VerrifyResult(result, iconInfoArray);
}

function VerrifyResult(result: Array<Icon>, iconInfoArray: Array<IconInfo>) {
  let index = 0;
  while (index < result.length) {
    const icon = result[index];
    let stackCount = 1;
    while (index + stackCount < result.length) {
      if (result[index + stackCount].IsSameIcon(icon)) {
        stackCount++;
      } else {
        break;
      }
    }

    let iconInfo: IconInfo = null;
    iconInfoArray.forEach(element => {
      element.IsSameIcon(icon.iconInfo, true);
      iconInfo = element;
    });

    if (iconInfo === null) {
      throw "Icon Info is Not Founded " + index + ", " + icon.iconInfo;
    }

    for (let stackIndex = 1; stackIndex < iconInfo.stackCount; stackIndex++) {
      const element = result[index + stackIndex];
      if (!element.IsSameIcon(icon)) {
        throw "Stack Failed " + index + ", " + icon.iconInfo;
      }
    }

    if (icon.iconInfo.blockdSameDisplay) {
      for (let displayHeight = -m_ReelDisplayHeight + 1 ; displayHeight < m_ReelDisplayHeight;displayHeight++) 
      {
        if(displayHeight == 0)
          continue;
        let displayIndex = CalculateIndexWithOffset(index, displayHeight, m_ReelDisplayHeight);

        const element = result[displayIndex];

        if (element.IsSameIcon(icon)) {
          throw "BlockIcon Failed " + index + ", " + icon.iconInfo;
        }
      }
    }

    index += stackCount;
  }

  console.log("Completed Verification");
}

main();
//TODO : STACk 심볼 , 심볼 그룹핑, 특정 심볼 고정위치
//
