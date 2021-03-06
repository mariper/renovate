import fs from 'fs';

import _got from '../../util/got';
import { getReleases } from './index';

const got: any = _got;

const res1 = fs.readFileSync(
  'lib/datasource/galaxy/__fixtures__/timezone',
  'utf8'
);
const empty = fs.readFileSync(
  'lib/datasource/galaxy/__fixtures__/empty',
  'utf8'
);

jest.mock('../../util/got');

describe('datasource/galaxy', () => {
  describe('getReleases', () => {
    it('returns null for empty result', async () => {
      got.mockReturnValueOnce(null);
      expect(
        await getReleases({ lookupName: 'non_existent_crate' })
      ).toBeNull();
    });
    it('returns null for missing fields', async () => {
      got.mockReturnValueOnce({
        body: undefined,
      });
      expect(
        await getReleases({ lookupName: 'non_existent_crate' })
      ).toBeNull();
    });
    it('returns null for empty list', async () => {
      got.mockReturnValueOnce({
        body: '\n',
      });
      expect(
        await getReleases({ lookupName: 'non_existent_crate' })
      ).toBeNull();
    });
    it('returns null for 404', async () => {
      got.mockImplementationOnce(() =>
        Promise.reject({
          statusCode: 404,
        })
      );
      expect(await getReleases({ lookupName: 'some_crate' })).toBeNull();
    });
    it('returns null for unknown error', async () => {
      got.mockImplementationOnce(() => {
        throw new Error();
      });
      expect(await getReleases({ lookupName: 'some_crate' })).toBeNull();
    });
    it('processes real data', async () => {
      got.mockReturnValueOnce({
        body: res1,
      });
      const res = await getReleases({ lookupName: 'yatesr.timezone' });
      expect(res).toMatchSnapshot();
      expect(res).not.toBeNull();
      expect(res).toBeDefined();
    });
    it('return null if searching random username and project name', async () => {
      got.mockReturnValueOnce({
        body: empty,
      });
      const res = await getReleases({ lookupName: 'foo.bar' });
      expect(res).toBeNull();
    });
    it('throws for 5xx', async () => {
      got.mockImplementationOnce(() =>
        Promise.reject({
          statusCode: 502,
        })
      );
      let e;
      try {
        await getReleases({ lookupName: 'some_crate' });
      } catch (err) {
        e = err;
      }
      expect(e).toBeDefined();
      expect(e).toMatchSnapshot();
    });
    it('throws for 404', async () => {
      const err = new Error();
      err.statusCode = 404;
      got.mockImplementationOnce(() => {
        throw err;
      });
      expect(await getReleases({ lookupName: 'foo.bar' })).toBeNull();
    });
  });
});
