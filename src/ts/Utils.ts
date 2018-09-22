function CalculateIndexWithOffset(currentIndex:number, offset:number, maxValue:number):number
{
    let index = currentIndex + offset;
    if(index < 0)
    {
        index += maxValue;
    }
    if(index >= maxValue)
    {
        index -= maxValue;
    }

    return index;
}