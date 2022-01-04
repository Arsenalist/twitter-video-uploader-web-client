import {textToTags} from "./textToTags";

const playersToTagMap = [
    {"precious achiuwa": "precious"},
    {"dalano banton": "banton"},
    {"pascal siakam": "siakam"},
    {"pascal siakam": "siakam2"},
    {"yuta watanabe": ""}]

describe('textToTags with special characters', () => {
    it('exclamation mark is ignored', () => {
        expect(textToTags('what a move by precious!', playersToTagMap)).toEqual(["precious"])
    })
    it('double exclamation mark is ignored', () => {
        expect(textToTags('what a move by precious!!', playersToTagMap)).toEqual(["precious"])
    })
    it('comma is ignored', () => {
        expect(textToTags('what a move by precious,', playersToTagMap)).toEqual(["precious"])
    })

})
