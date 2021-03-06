import 'mocha';
import {expect} from 'chai';
import nock from 'nock';

import fetch from 'node-fetch';
import FetchSelector from '../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {ConseilMetadataClient} from '../../src/reporting/ConseilMetadataClient'

import mochaAsync from '../../test/mochaTestHelper';

import {
    platformsResponse, networksResponse, entityResponse, blockAttributeResponse, accountAttributeValueResponse, accountAttributePrefixedValueResponse, errorResponse
} from './ConseilMetadataClient.responses';

describe('ConseilJS API Wrapper for Conseil protocol v2 test suite', () => {
    it('retrieve list of available platforms', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/platforms').reply(200, platformsResponse);

        const result = await ConseilMetadataClient.getPlatforms({ url: 'http://conseil.server', apiKey: 'c0ffee' });

        expect(result.map((v) => { return v.name})).to.contain('tezos');
    }));

    it('retrieve list of available networks given a platform: tezos', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/networks').reply(200, networksResponse);

        const result = await ConseilMetadataClient.getNetworks({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos');

        expect(result[0].platform).to.equal('tezos')
    }));

    it('retrieve list of available entities for a platform/network combination', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/entities').reply(200, entityResponse);

        const result = await ConseilMetadataClient.getEntities({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet');

        expect(result.length).to.greaterThan(1);
    }));

    it('retrieve list of available attributes for a platform/network/entity combination', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/blocks/attributes').reply(200, blockAttributeResponse);

        const result = await ConseilMetadataClient.getAttributes({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet', 'blocks');

        expect(result.length).to.greaterThan(1);
    }));

    it('get distinct attribute values', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/accounts/spendable').reply(200, accountAttributeValueResponse);

        const result = await ConseilMetadataClient.getAttributeValues({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet', 'accounts', 'spendable');

        expect(result.length).to.equal(2);
    }));

    it('get distinct attribute values', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/accounts/account_id/tz3').reply(200, accountAttributePrefixedValueResponse);

        const result = await ConseilMetadataClient.getAttributeValuesForPrefix({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet', 'accounts', 'account_id', 'tz3');

        expect(result.length).to.be.greaterThan(2);
    }));

    it('test error conditions', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.get('/v2/metadata/tezos/alphanet/accounts/account_id/tz3').reply(200, errorResponse);

        const result = await ConseilMetadataClient.getAttributeValuesForPrefix({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'tezos', 'alphanet', 'accounts', 'account_id', 'tz3');

        expect(result).to.be.undefined;
    }));
});
