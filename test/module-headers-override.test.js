import {
    setup,
    get,
} from '@nuxtjs/module-test-utils';
import { JSDOM } from 'jsdom';

// Nuxt config
import config from '../example/nuxt.config';

const BASE_URL = '/';

config.dev = false;
config.router.base = BASE_URL;
config.server.host = 'localhost';
config.server.port = 3000;

// New features
config.pruneHtml = {
    selectorToKeep: '.nuxt-prune--keep',
    script: [
        {
            src: '#',
            position: 'head',
        },
        {
            src: '#',
            position: 'pbody',
        },
        {
            src: '#',
        },
    ],
    link: [
        {
            src: '#',
            rel: 'preload',
            as: 'script',
            position: 'phead',
        },
    ],
    headerOverrideName: 'custom-name',
};

// Url generator for User Agents
const headers = ua => (
    ! ua
    ? {}
    : {
        'custom-name': ua,
    }
);

// Tests
describe(
    'module',
    () => {

        let nuxt;

        beforeAll(
            async() => {

                (
                    { nuxt } = (
                        await setup(
                            config
                        )
                    )
                );

            },
            60000
        );

        afterAll(
            async() => {

                await nuxt.close();

            }
        );

        const getElements = async(
                selector,
                ua
            ) => {

                const html = await get(
                        BASE_URL,
                        {
                            headers: headers(
                                ua
                            ),
                        }
                    )
                    , { window } = new JSDOM(
                        html
                    ).window
                    , elements = window.document.querySelectorAll(
                        selector
                    )
                ;

                return elements.length;

            }
            , getHtmlDocument = async ua => {

                const html = await get(
                        BASE_URL,
                        {
                            headers: headers(
                                ua
                            ),
                        }
                    )
                    , { window } = new JSDOM(
                        html
                    ).window
                    , elements = window.document
                ;

                return elements;

            }
        ;

        describe(
            'human',
            () => {

                test(
                    'preload-scripts',
                    async() => {

                        const elements = await getElements(
                            'link[rel="preload"][as="script"]'
                        );

                        // Test
                        expect(
                            elements
                        ).toBeGreaterThanOrEqual(
                            0
                        );

                    }
                );

                test(
                    'scripts',
                    async() => {

                        const elements = await getElements(
                            'script:not([type="application/ld+json"])',
                        );

                        // Test
                        expect(
                            elements
                        ).toBeGreaterThanOrEqual(
                            1
                        );

                    }
                );

                test(
                    'scripts-maintained',
                    async() => {

                        const elements = await getElements(
                            `script${ config.pruneHtml.selectorToKeep }`,
                        );

                        // Test
                        expect(
                            elements
                        ).toEqual(
                            1
                        );

                    }
                );

                test(
                    'scripts-positions',
                    async() => {

                        const elements = await getHtmlDocument();

                        // Test
                        expect(
                            elements.head.firstChild.tagName !== 'LINK'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.head.lastChild.tagName !== 'SCRIPT'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.body.firstChild.tagName !== 'SCRIPT'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.body.lastChild.tagName !== 'SCRIPT'
                        ).toEqual(
                            true
                        );

                    }
                );

            }
        );

        describe(
            'bot',
            () => {

                const USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

                test(
                    'preload-scripts',
                    async() => {

                        const elements = await getElements(
                            'link[rel="preload"][as="script"]',
                            USER_AGENT
                        );

                        // Test
                        expect(
                            elements
                        ).toEqual(
                            1
                        );

                    }
                );

                test(
                    'scripts',
                    async() => {

                        const elements = await getElements(
                            'script:not([type="application/ld+json"])',
                            USER_AGENT
                        );

                        // Test
                        expect(
                            elements
                        ).toEqual(
                            4
                        );

                    }
                );

                test(
                    'scripts-maintained',
                    async() => {

                        const elements = await getElements(
                            `script${ config.pruneHtml.selectorToKeep }`,
                            USER_AGENT
                        );

                        // Test
                        expect(
                            elements
                        ).toEqual(
                            1
                        );

                    }
                );

                test(
                    'scripts-positions',
                    async() => {

                        const elements = await getHtmlDocument(
                            USER_AGENT,
                        );

                        // Test
                        expect(
                            elements.head.firstChild.tagName === 'LINK'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.head.lastChild.tagName === 'SCRIPT'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.body.firstChild.tagName === 'SCRIPT'
                        ).toEqual(
                            true
                        );

                        expect(
                            elements.body.lastChild.tagName === 'SCRIPT'
                        ).toEqual(
                            true
                        );

                    }
                );

            }
        );

    }
);
