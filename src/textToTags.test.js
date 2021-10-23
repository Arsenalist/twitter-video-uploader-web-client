import {textToTags} from "./textToTags";

const playersToTagMap = [
    {"precious achiuwa": "precious"},
    {"dalano banton": "banton"},
    {"pascal siakam": "siakam"},
    {"pascal siakam": "siakam2"},
    {"yuta watanabe": ""}]

describe('textToTags', () => {
    it('single word in text matches first word in test string', () => {
        expect(textToTags('this is a precious highlight', playersToTagMap)).toEqual(["precious"])
    })
    it('single word in text matches last word in test string', () => {
        expect(textToTags('this is a highlight very precious', playersToTagMap)).toEqual(["precious"])
    })
    it('multiple words in text match single word in test string', () => {
        expect(textToTags('banton is so good that banton can banton', playersToTagMap)).toEqual(["banton"])
    })
    it('multiple words in text match multiple word in test string', () => {
        expect(textToTags('dalano banton is a dalano banton', playersToTagMap)).toEqual(["banton"])
    })
    it('multiple words in text match multiple word in test string in multiple tuples', () => {
        expect(textToTags('paskal siakam is a pascal siakam', playersToTagMap)).toEqual(["siakam", "siakam2"])
    })
    it('no matches found', () => {
        expect(textToTags('nothing doing', playersToTagMap)).toEqual([])
    })
    it('undefined text', () => {
        expect(textToTags(undefined, playersToTagMap)).toEqual([])
    })
    it('empty text', () => {
        expect(textToTags("", playersToTagMap)).toEqual([])
    })
    it('padded empty text', () => {
        expect(textToTags("   ", playersToTagMap)).toEqual([])
    })
    it('the tag specified for text is empty', () => {
        expect(textToTags("this is yuta and my world", playersToTagMap)).toEqual([])
    })
})
