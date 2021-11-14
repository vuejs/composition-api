<a name="1.4.0"></a>
# [1.4.0](https://github.com/vuejs/composition-api/compare/v1.4.0-beta.0...v1.4.0) (2021-11-14)



<a name="1.4.0-beta.0"></a>
# [1.4.0-beta.0](https://github.com/vuejs/composition-api/compare/v1.3.3...v1.4.0-beta.0) (2021-11-07)


### Features

* add component $emit typing support ([#846](https://github.com/vuejs/composition-api/issues/846)) ([b980175](https://github.com/vuejs/composition-api/commit/b980175))



<a name="1.3.3"></a>
## [1.3.3](https://github.com/vuejs/composition-api/compare/v1.3.2...v1.3.3) (2021-11-03)


### Features

* **types:** allow a generic in App type ([#845](https://github.com/vuejs/composition-api/issues/845)) ([48729d9](https://github.com/vuejs/composition-api/commit/48729d9))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/vuejs/composition-api/compare/v1.3.1...v1.3.2) (2021-11-03)


### Bug Fixes

* changing prop causes rerender to lose attributes [#840](https://github.com/vuejs/composition-api/issues/840) ([#843](https://github.com/vuejs/composition-api/issues/843)) ([a43090d](https://github.com/vuejs/composition-api/commit/a43090d))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/vuejs/composition-api/compare/v1.3.0...v1.3.1) (2021-11-01)


### Bug Fixes

* **types:** defineComponent object format with no props type ([#839](https://github.com/vuejs/composition-api/issues/839)) ([8a31c78](https://github.com/vuejs/composition-api/commit/8a31c78))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/vuejs/composition-api/compare/v1.2.4...v1.3.0) (2021-10-28)


### Bug Fixes

* attrs update not correctly mapped to props [#833](https://github.com/vuejs/composition-api/issues/833) ([#835](https://github.com/vuejs/composition-api/issues/835)) ([90b086b](https://github.com/vuejs/composition-api/commit/90b086b))



<a name="1.2.4"></a>
## [1.2.4](https://github.com/vuejs/composition-api/compare/v1.2.3...v1.2.4) (2021-10-07)


### Bug Fixes

* add `type` to component instance ([#828](https://github.com/vuejs/composition-api/issues/828)) ([b9b603f](https://github.com/vuejs/composition-api/commit/b9b603f))



<a name="1.2.3"></a>
## [1.2.3](https://github.com/vuejs/composition-api/compare/v1.2.2...v1.2.3) (2021-10-05)


### Bug Fixes

* **proxyRefs:** When using proxyRefs, the internal variable composition-api.refKey is exposed on the object itself [#817](https://github.com/vuejs/composition-api/issues/817) ([#818](https://github.com/vuejs/composition-api/issues/818)) ([92b7eb1](https://github.com/vuejs/composition-api/commit/92b7eb1))
* **ssr:** `set()` twice lose reactivity ([#821](https://github.com/vuejs/composition-api/issues/821)) ([416845a](https://github.com/vuejs/composition-api/commit/416845a))
* correct prop type inference when using PropType<unknown> ([#825](https://github.com/vuejs/composition-api/issues/825)) ([9c9f8e8](https://github.com/vuejs/composition-api/commit/9c9f8e8))


### Features

* **computed:** allow differentiating refs from computed ([#820](https://github.com/vuejs/composition-api/issues/820)) ([68b5d97](https://github.com/vuejs/composition-api/commit/68b5d97))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/vuejs/composition-api/compare/v1.2.1...v1.2.2) (2021-09-24)


### Reverts

* "fix: use `.mjs` by default", close [#815](https://github.com/vuejs/composition-api/issues/815) ([96899ce](https://github.com/vuejs/composition-api/commit/96899ce))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/vuejs/composition-api/compare/v1.2.0...v1.2.1) (2021-09-21)


### Features

* **types:** align ComponentPublicInstance type ([2f9cfbf](https://github.com/vuejs/composition-api/commit/2f9cfbf))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/vuejs/composition-api/compare/v1.1.5...v1.2.0) (2021-09-21)


### Bug Fixes

* importing from esm in node ([#814](https://github.com/vuejs/composition-api/issues/814)) ([8c61b07](https://github.com/vuejs/composition-api/commit/8c61b07))
* use `.mjs` by default ([2699348](https://github.com/vuejs/composition-api/commit/2699348))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/vuejs/composition-api/compare/v1.1.4...v1.1.5) (2021-09-09)


### Bug Fixes

* improve `isReadonly` behaviour, close [#811](https://github.com/vuejs/composition-api/issues/811), close [#812](https://github.com/vuejs/composition-api/issues/812) ([d3c456a](https://github.com/vuejs/composition-api/commit/d3c456a))
* **api-watch:** watching nested ref array w/ deep doesn't work ([#808](https://github.com/vuejs/composition-api/issues/808)) ([b625420](https://github.com/vuejs/composition-api/commit/b625420))



<a name="1.1.4"></a>
## [1.1.4](https://github.com/vuejs/composition-api/compare/v1.1.3...v1.1.4) (2021-08-31)


### Bug Fixes

* **types:** align emits type with vue-next ([565cbd1](https://github.com/vuejs/composition-api/commit/565cbd1))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/vuejs/composition-api/compare/v1.1.2...v1.1.3) (2021-08-22)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/vuejs/composition-api/compare/v1.1.1...v1.1.2) (2021-08-21)


### Bug Fixes

* **set:** reactive in SSR w/ set ([#796](https://github.com/vuejs/composition-api/issues/796)) ([3a1837f](https://github.com/vuejs/composition-api/commit/3a1837f))
* **setup:** should not trigger getter w/ object computed nested ([#799](https://github.com/vuejs/composition-api/issues/799)) ([72a878d](https://github.com/vuejs/composition-api/commit/72a878d))
* **watch:** always triggers when watching multiple refs ([#791](https://github.com/vuejs/composition-api/issues/791)) ([8beffc3](https://github.com/vuejs/composition-api/commit/8beffc3))
* typos ([#788](https://github.com/vuejs/composition-api/issues/788)) ([59653ac](https://github.com/vuejs/composition-api/commit/59653ac))


### Features

* implement api `useSlots` and `useAttrs` ([#800](https://github.com/vuejs/composition-api/issues/800)) ([1e6e3a9](https://github.com/vuejs/composition-api/commit/1e6e3a9))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/vuejs/composition-api/compare/v1.1.0...v1.1.1) (2021-08-14)


### Bug Fixes

* don't invoke Vue getters in setter ([#786](https://github.com/vuejs/composition-api/issues/786)) ([e67940f](https://github.com/vuejs/composition-api/commit/e67940f)), closes [#498](https://github.com/vuejs/composition-api/issues/498)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/vuejs/composition-api/compare/v1.1.0-beta.7...v1.1.0) (2021-08-09)


### Features

* align with Vue [v3.2](https://blog.vuejs.org/posts/vue-3.2.html)
* new `watchPostEffect` api ([92fe90c](https://github.com/vuejs/composition-api/commit/92fe90c))
* new `watchSyncEffect` api ([e12c23d](https://github.com/vuejs/composition-api/commit/e12c23d))
* new `effectScope` api ([#762](https://github.com/vuejs/composition-api/issues/762)) ([fcadec2](https://github.com/vuejs/composition-api/commit/fcadec2))

<a name="1.0.6"></a>
## [1.0.6](https://github.com/vuejs/composition-api/compare/v1.1.0-beta.5...v1.0.6) (2021-08-09)


### Features

* support second target argument for lifecycle functions ([3f3b9c6](https://github.com/vuejs/composition-api/commit/3f3b9c6))



<a name="1.1.0-beta.7"></a>
# [1.1.0-beta.7](https://github.com/vuejs/composition-api/compare/v1.1.0-beta.6...v1.1.0-beta.7) (2021-08-09)

### Bug Fixes

* **effectScope:** should have a vaild scope with component ([da21873](https://github.com/vuejs/composition-api/commit/da21873))


<a name="1.1.0-beta.6"></a>
# [1.1.0-beta.6](https://github.com/vuejs/composition-api/compare/v1.1.0-beta.5...v1.1.0-beta.6) (2021-08-09)

* new watchPostEffect api ([92fe90c](https://github.com/vuejs/composition-api/commit/92fe90c))
* support second target argument for lifecycle functions ([0133c1e](https://github.com/vuejs/composition-api/commit/0133c1e))


<a name="1.1.0-beta.4"></a>
# [1.1.0-beta.4](https://github.com/vuejs/composition-api/compare/v1.0.4...v1.1.0-beta.4) (2021-07-22)


### Bug Fixes

* revert module field to `esm.js` version, close [#769](https://github.com/vuejs/composition-api/issues/769) ([92afa6f](https://github.com/vuejs/composition-api/commit/92afa6f))



<a name="1.1.0-beta.3"></a>
# [1.1.0-beta.3](https://github.com/vuejs/composition-api/compare/v1.0.3...v1.1.0-beta.3) (2021-07-18)


### Bug Fixes

* build for mjs and exports all submodules ([c116714](https://github.com/vuejs/composition-api/commit/c116714))



<a name="1.1.0-beta.2"></a>
# [1.1.0-beta.2](https://github.com/vuejs/composition-api/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2021-07-16)


### Bug Fixes

* **effectScope:** should stop along with parent component ([784d96c](https://github.com/vuejs/composition-api/commit/784d96c))



<a name="1.1.0-beta.1"></a>
# [1.1.0-beta.1](https://github.com/vuejs/composition-api/compare/v1.0.2...v1.1.0-beta.1) (2021-07-16)


### Features

* implement `effectScope` api ([#762](https://github.com/vuejs/composition-api/issues/762)) ([fcadec2](https://github.com/vuejs/composition-api/commit/fcadec2))


### Features

* implement `effectScope` api ([#762](https://github.com/vuejs/composition-api/issues/762)) ([fcadec2](https://github.com/vuejs/composition-api/commit/fcadec2))
* support second target argument for lifecycle functions ([3f3b9c6](https://github.com/vuejs/composition-api/commit/3f3b9c6))


<a name="1.0.6"></a>
## [1.0.6](https://github.com/vuejs/composition-api/compare/v1.0.5...v1.0.6) (2021-08-09)


### Features

<a name="1.0.5"></a>
## [1.0.5](https://github.com/vuejs/composition-api/compare/v1.0.4...v1.0.5) (2021-08-01)


### Bug Fixes

* **function:** properties of function should not disappear. ([#778](https://github.com/vuejs/composition-api/issues/778)) ([68c1a35](https://github.com/vuejs/composition-api/commit/68c1a35))



<a name="1.0.4"></a>
## [1.0.4](https://github.com/vuejs/composition-api/compare/v1.0.3...v1.0.4) (2021-07-22)


### Bug Fixes

* revert module field to `esm.js` version, close [#769](https://github.com/vuejs/composition-api/issues/769) ([4ac545c](https://github.com/vuejs/composition-api/commit/4ac545c))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/vuejs/composition-api/compare/v1.0.2...v1.0.3) (2021-07-18)


### Bug Fixes

* build for mjs and exports all submodules ([69538ee](https://github.com/vuejs/composition-api/commit/69538ee))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/vuejs/composition-api/compare/v1.0.1...v1.0.2) (2021-07-16)


### Bug Fixes

* **readonly:** align behavior with vue-next. ([#765](https://github.com/vuejs/composition-api/issues/765)) ([42104aa](https://github.com/vuejs/composition-api/commit/42104aa))
* **type:** remove unnecessary type assertion ([#766](https://github.com/vuejs/composition-api/issues/766)) ([ebb7975](https://github.com/vuejs/composition-api/commit/ebb7975))
* should dynamically update refs in context ([#764](https://github.com/vuejs/composition-api/issues/764)) ([d7de23e](https://github.com/vuejs/composition-api/commit/d7de23e))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/vuejs/composition-api/compare/v1.0.0...v1.0.1) (2021-07-16)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.14...v1.0.0) (2021-07-15)


### Bug Fixes

* **mockReactivityDeep:** add parameter seen for mockReactivityDeep. ([#759](https://github.com/vuejs/composition-api/issues/759)) ([40cb14a](https://github.com/vuejs/composition-api/commit/40cb14a))
* **runtime-core:**  trigger warning when the injectionKey is undefined ([#760](https://github.com/vuejs/composition-api/issues/760)) ([2ccad9b](https://github.com/vuejs/composition-api/commit/2ccad9b))



<a name="1.0.0-rc.14"></a>
# [1.0.0-rc.14](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2021-07-12)


### Bug Fixes

* **customReactive:** avoid circular reference. ([#758](https://github.com/vuejs/composition-api/issues/758)) ([2bd6ea5](https://github.com/vuejs/composition-api/commit/2bd6ea5))
* **watch:** traverse refs in deep watch ([#753](https://github.com/vuejs/composition-api/issues/753)) ([55a0a20](https://github.com/vuejs/composition-api/commit/55a0a20))
* only trigger warning in the dev environment ([#755](https://github.com/vuejs/composition-api/issues/755)) ([bc7c2af](https://github.com/vuejs/composition-api/commit/bc7c2af))
* **watch:** errors thrown in the asynchronous callback function in watch will not be caught. ([#751](https://github.com/vuejs/composition-api/issues/751)) ([f0e423f](https://github.com/vuejs/composition-api/commit/f0e423f))
* **watch:** only trigger warning in the dev environment ([#754](https://github.com/vuejs/composition-api/issues/754)) ([0fe0088](https://github.com/vuejs/composition-api/commit/0fe0088))



<a name="1.0.0-rc.13"></a>
# [1.0.0-rc.13](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2021-07-02)


### Bug Fixes

* **observe:** solve the Ref not unwrapping on the ssr side issue with recursive way. ([#723](https://github.com/vuejs/composition-api/issues/723)) ([debd37d](https://github.com/vuejs/composition-api/commit/debd37d))
* the hasOwn should be used to determine whether an attribute exists. ([#737](https://github.com/vuejs/composition-api/issues/737)) ([65abcb4](https://github.com/vuejs/composition-api/commit/65abcb4))
* **shallowReadonly:** align behavior with vue-next ([#741](https://github.com/vuejs/composition-api/issues/741)) ([14d1c7b](https://github.com/vuejs/composition-api/commit/14d1c7b))
* **types:** use AnyObject insteads of any ([#742](https://github.com/vuejs/composition-api/issues/742)) ([efb4195](https://github.com/vuejs/composition-api/commit/efb4195))



<a name="1.0.0-rc.12"></a>
# [1.0.0-rc.12](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2021-06-17)


### Bug Fixes

* **proxyRefs:** infinite loop when using proxyRefs. ([#730](https://github.com/vuejs/composition-api/issues/730)) ([0b6ab25](https://github.com/vuejs/composition-api/commit/0b6ab25))
* **reactivity:** check type of __ob__ in isRaw and isReactive ([#732](https://github.com/vuejs/composition-api/issues/732)) ([97dd671](https://github.com/vuejs/composition-api/commit/97dd671))
* **watch:** watched previous values can't be destructure on first fire. ([#727](https://github.com/vuejs/composition-api/issues/727)) ([b3ab6f9](https://github.com/vuejs/composition-api/commit/b3ab6f9))



<a name="1.0.0-rc.11"></a>
# [1.0.0-rc.11](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2021-06-04)


### Bug Fixes

* **reactivity:** should trigger watchEffect when using set to change value of array length ([#720](https://github.com/vuejs/composition-api/issues/720)) ([9c03a45](https://github.com/vuejs/composition-api/commit/9c03a45))
* **reactivity:** unexpected behaviors for array index out of valid array length when set and del ([#719](https://github.com/vuejs/composition-api/issues/719)) ([f08a1d6](https://github.com/vuejs/composition-api/commit/f08a1d6))
* **shallowReactive:** should keep array as array ([#717](https://github.com/vuejs/composition-api/issues/717)) ([620d09b](https://github.com/vuejs/composition-api/commit/620d09b))
* **shallowReadonly:** watch should work for ref/reactive with shallowReadonly ([#714](https://github.com/vuejs/composition-api/issues/714)) ([b6fc1f7](https://github.com/vuejs/composition-api/commit/b6fc1f7))


### Features

* **reactivity:** unwrap value when using `set` ([#722](https://github.com/vuejs/composition-api/issues/722)) ([bd198e7](https://github.com/vuejs/composition-api/commit/bd198e7))



<a name="1.0.0-rc.10"></a>
# [1.0.0-rc.10](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2021-05-27)


### Bug Fixes

* **dev:** setup data in nextTick is proxied to vm._data. ([#697](https://github.com/vuejs/composition-api/issues/697)) ([e231837](https://github.com/vuejs/composition-api/commit/e231837))
* **watch:** align behavior with vue-next(doWatch). ([#710](https://github.com/vuejs/composition-api/issues/710)) ([fcf8bc3](https://github.com/vuejs/composition-api/commit/fcf8bc3))



<a name="1.0.0-rc.9"></a>
# [1.0.0-rc.9](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2021-05-19)


### Bug Fixes

* The behavior of development and production merge should be consistent. ([#694](https://github.com/vuejs/composition-api/issues/694)) ([7ca7010](https://github.com/vuejs/composition-api/commit/7ca7010))
* **shallowReactive:** align behavior with vue-next ([#696](https://github.com/vuejs/composition-api/issues/696)) ([3485ecb](https://github.com/vuejs/composition-api/commit/3485ecb))


### Features

* add and delete object attributes would trigger update. ([#692](https://github.com/vuejs/composition-api/issues/692)) ([8c27d80](https://github.com/vuejs/composition-api/commit/8c27d80))



<a name="1.0.0-rc.8"></a>
# [1.0.0-rc.8](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2021-04-29)


### Bug Fixes

* **reactive:** align behavior with vue-next ([#689](https://github.com/vuejs/composition-api/issues/689)) ([37fcbaa](https://github.com/vuejs/composition-api/commit/37fcbaa))
* Memory leak caused by global variables. ([#686](https://github.com/vuejs/composition-api/issues/686)) ([badff82](https://github.com/vuejs/composition-api/commit/badff82))



<a name="1.0.0-rc.7"></a>
# [1.0.0-rc.7](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2021-04-18)


### Bug Fixes

* **types:** optional Boolean prop types [#636](https://github.com/vuejs/composition-api/issues/636) ([#678](https://github.com/vuejs/composition-api/issues/678)) ([a081227](https://github.com/vuejs/composition-api/commit/a081227))


### Features

* **types:** export ComponentInternalInstance, close [#677](https://github.com/vuejs/composition-api/issues/677), close [#675](https://github.com/vuejs/composition-api/issues/675) ([ccae670](https://github.com/vuejs/composition-api/commit/ccae670))



<a name="1.0.0-rc.6"></a>
# [1.0.0-rc.6](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2021-03-29)


### Bug Fixes

* **types:** allow any object in toRefs ([#668](https://github.com/vuejs/composition-api/issues/668)) ([7284ad9](https://github.com/vuejs/composition-api/commit/7284ad9))



<a name="1.0.0-rc.5"></a>
# [1.0.0-rc.5](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2021-03-11)



<a name="1.0.0-rc.4"></a>
# [1.0.0-rc.4](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2021-03-11)


### Bug Fixes

* **types:** RequiredKeys type ([#655](https://github.com/vuejs/composition-api/issues/655)) ([0677a18](https://github.com/vuejs/composition-api/commit/0677a18))



<a name="1.0.0-rc.3"></a>
# [1.0.0-rc.3](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2021-03-03)


### Bug Fixes

* update types to algin with vue-next ([#653](https://github.com/vuejs/composition-api/issues/653)) ([24eaa56](https://github.com/vuejs/composition-api/commit/24eaa56))



<a name="1.0.0-rc.2"></a>
# [1.0.0-rc.2](https://github.com/vuejs/composition-api/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2021-02-18)


### Bug Fixes

* add missing App export ([#640](https://github.com/vuejs/composition-api/issues/640)) ([eda6b22](https://github.com/vuejs/composition-api/commit/eda6b22))


### Features

* add defineAsyncComponent API ([#644](https://github.com/vuejs/composition-api/issues/644)) ([8409f48](https://github.com/vuejs/composition-api/commit/8409f48))



<a name="1.0.0-rc.1"></a>
# [1.0.0-rc.1](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.26...v1.0.0-rc.1) (2021-01-20)



<a name="1.0.0-beta.26"></a>
# [1.0.0-beta.26](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2021-01-14)


### Bug Fixes

* **types:** expose ExtractPropTypes type, close [#628](https://github.com/vuejs/composition-api/issues/628) ([903a0aa](https://github.com/vuejs/composition-api/commit/903a0aa))
* change duplicate installation from error to warn, close [#631](https://github.com/vuejs/composition-api/issues/631) ([#632](https://github.com/vuejs/composition-api/issues/632)) ([5301d49](https://github.com/vuejs/composition-api/commit/5301d49))
* Date infer string in props ([#627](https://github.com/vuejs/composition-api/issues/627)) ([b2acb2d](https://github.com/vuejs/composition-api/commit/b2acb2d))



<a name="1.0.0-beta.25"></a>
# [1.0.0-beta.25](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2021-01-08)

## BREAKING CHANGES

- `useCSSModule` renamed to `useCssModule` to align with Vue 3 (#626)
- `useCSSModule` is depreacted.


<a name="1.0.0-beta.24"></a>
# [1.0.0-beta.24](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2021-01-06)


### Bug Fixes

* **getCurrentInstance:** emit event ([#624](https://github.com/vuejs/composition-api/issues/624)) ([cf5fa2b](https://github.com/vuejs/composition-api/commit/cf5fa2b))



<a name="1.0.0-beta.23"></a>
# [1.0.0-beta.23](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.22...v1.0.0-beta.23) (2021-01-05)


### Bug Fixes

* useCSSModule to adapt the change of getCurrentInstance, close [#620](https://github.com/vuejs/composition-api/issues/620) ([#622](https://github.com/vuejs/composition-api/issues/622)) ([2ddead0](https://github.com/vuejs/composition-api/commit/2ddead0))
* **README:** The correct option name is `emits` ([#617](https://github.com/vuejs/composition-api/issues/617)) ([4b2f1ab](https://github.com/vuejs/composition-api/commit/4b2f1ab))



<a name="1.0.0-beta.22"></a>
# [1.0.0-beta.22](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2020-12-19)


### Features

* **getCurrentInstance:** Aligning with vue3 ([#520](https://github.com/vuejs/composition-api/issues/520)) ([1495a46](https://github.com/vuejs/composition-api/commit/1495a46))


### BREAKING CHANGES

* **getCurrentInstance:** The internal vm can be accessed with `getCurrentInstance().proxy`

```js
const vm = getCurrentInstance()

// becomes

const vm = getCurrentInstance().proxy
```


<a name="1.0.0-beta.21"></a>
# [1.0.0-beta.21](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2020-12-07)


### Bug Fixes

* destructure `attrs` from context keep reactive, close [#264](https://github.com/vuejs/composition-api/issues/264) ([#594](https://github.com/vuejs/composition-api/issues/594)) ([4eecd66](https://github.com/vuejs/composition-api/commit/4eecd66))


### Features

* add type-level `readonly()` api ([#593](https://github.com/vuejs/composition-api/issues/593)) ([3b726d4](https://github.com/vuejs/composition-api/commit/3b726d4))



<a name="1.0.0-beta.20"></a>
# [1.0.0-beta.20](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2020-11-24)


### Bug Fixes

* **types:** improve SetupContext types ([#595](https://github.com/vuejs/composition-api/issues/595)) ([49766bf](https://github.com/vuejs/composition-api/commit/49766bf))


### Features

* add warn ([#596](https://github.com/vuejs/composition-api/issues/596)) ([dd2cd6b](https://github.com/vuejs/composition-api/commit/dd2cd6b))



<a name="1.0.0-beta.19"></a>
# [1.0.0-beta.19](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2020-11-02)


### Bug Fixes

* **types:** allow any custom options for defineComponent, fix [#579](https://github.com/vuejs/composition-api/issues/579) ([#584](https://github.com/vuejs/composition-api/issues/584)) ([7cdf1e5](https://github.com/vuejs/composition-api/commit/7cdf1e5))
* **types:** attrs in SetupContext fix[#562](https://github.com/vuejs/composition-api/issues/562) ([#582](https://github.com/vuejs/composition-api/issues/582)) ([2d6de26](https://github.com/vuejs/composition-api/commit/2d6de26))
* **types:** this type in data(), fix [#570](https://github.com/vuejs/composition-api/issues/570) ([#576](https://github.com/vuejs/composition-api/issues/576)) ([9a5b438](https://github.com/vuejs/composition-api/commit/9a5b438))



<a name="1.0.0-beta.18"></a>
# [1.0.0-beta.18](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2020-10-21)


### Bug Fixes

* **type:** vue constructor should not require props with default values ([#567](https://github.com/vuejs/composition-api/issues/567)) ([964f9f3](https://github.com/vuejs/composition-api/commit/964f9f3))
* better `vueDependency` importing, close [#564](https://github.com/vuejs/composition-api/issues/564) ([#572](https://github.com/vuejs/composition-api/issues/572)) ([555f20a](https://github.com/vuejs/composition-api/commit/555f20a))


### Features

* **reactivity:** add Vue.delete workaround ([#571](https://github.com/vuejs/composition-api/issues/571)) ([b41da83](https://github.com/vuejs/composition-api/commit/b41da83))



<a name="1.0.0-beta.17"></a>
# [1.0.0-beta.17](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2020-10-17)


### Bug Fixes

* **types:** prop type infer, fix [#555](https://github.com/vuejs/composition-api/issues/555) ([#561](https://github.com/vuejs/composition-api/issues/561)) ([35f8fec](https://github.com/vuejs/composition-api/commit/35f8fec))


### Code Refactoring

* watch APIs default to trigger pre-flush ([#566](https://github.com/vuejs/composition-api/issues/566)) ([ded5ab7](https://github.com/vuejs/composition-api/commit/ded5ab7)), closes [#1706](https://github.com/vuejs/composition-api/issues/1706)


### BREAKING CHANGES

* watch APIs now default to use `flush: 'pre'` instead of
`flush: 'post'`.

  - Check https://github.com/vuejs/vue-next/commit/49bb44756fda0a7019c69f2fa6b880d9e41125aa 

  - This change affects `watch`, `watchEffect`, the `watch` component
    option, and `this.$watch`.

  - As pointed out by @skirtles-code in



<a name="1.0.0-beta.16"></a>
# [1.0.0-beta.16](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2020-10-10)


### Bug Fixes

* **SSR:** value set for props, fix [#550](https://github.com/vuejs/composition-api/issues/550) ([#551](https://github.com/vuejs/composition-api/issues/551)) ([5b1b094](https://github.com/vuejs/composition-api/commit/5b1b094))
* add emits options to defineComponent(fix [#553](https://github.com/vuejs/composition-api/issues/553)) ([#554](https://github.com/vuejs/composition-api/issues/554)) ([e44311f](https://github.com/vuejs/composition-api/commit/e44311f))



<a name="1.0.0-beta.15"></a>
# [1.0.0-beta.15](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2020-10-04)


### Bug Fixes

* **reactive:** fix issue when using reactive `array` in the template ([#532](https://github.com/vuejs/composition-api/issues/532)) ([d99b91d](https://github.com/vuejs/composition-api/commit/d99b91d))
* `reactive` in SSR ([#546](https://github.com/vuejs/composition-api/issues/546)) ([535c829](https://github.com/vuejs/composition-api/commit/535c829))
* incorrect warning for `getRegisteredVueOrDefault`, resolve [#544](https://github.com/vuejs/composition-api/issues/544) ([3a1d992](https://github.com/vuejs/composition-api/commit/3a1d992))
* reactive for props ([#547](https://github.com/vuejs/composition-api/issues/547)) ([4d39443](https://github.com/vuejs/composition-api/commit/4d39443))
* **vue-test:** prevent warning when using multiple `localVue` ([#531](https://github.com/vuejs/composition-api/issues/531)) ([5484bb7](https://github.com/vuejs/composition-api/commit/5484bb7))



<a name="1.0.0-beta.14"></a>
# [1.0.0-beta.14](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2020-09-15)


### Bug Fixes

* circular objects and making all Vue.observable objects isReactive ([#512](https://github.com/vuejs/composition-api/issues/512)) ([f204daa](https://github.com/vuejs/composition-api/commit/f204daa))


### Features

* **reactive:** allow usage of reactive before `Vue.use` ([#515](https://github.com/vuejs/composition-api/issues/515)) ([89fd11c](https://github.com/vuejs/composition-api/commit/89fd11c))



<a name="1.0.0-beta.13"></a>
# [1.0.0-beta.13](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2020-09-12)


### Bug Fixes

* **sets:** check for window to avoid SSR errors ([#511](https://github.com/vuejs/composition-api/issues/511)) ([9ea7230](https://github.com/vuejs/composition-api/commit/9ea7230))



<a name="1.0.0-beta.12"></a>
# [1.0.0-beta.12](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2020-09-12)


### Features

* allow plugin to be installed in localVue ([#497](https://github.com/vuejs/composition-api/issues/497)) ([07be9d7](https://github.com/vuejs/composition-api/commit/07be9d7))
* improve reactive checks ([#502](https://github.com/vuejs/composition-api/issues/502)) ([255dc72](https://github.com/vuejs/composition-api/commit/255dc72))
* **inject:** add `treatDefaultAsFactory` argument ([#503](https://github.com/vuejs/composition-api/issues/503)) ([78592bf](https://github.com/vuejs/composition-api/commit/78592bf))



<a name="1.0.0-beta.11"></a>
# [1.0.0-beta.11](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.9...v1.0.0-beta.11) (2020-08-22)


### Bug Fixes

* **setup:** handle updates for directly return a reactive object ([#488](https://github.com/vuejs/composition-api/issues/488)) ([a7f2c25](https://github.com/vuejs/composition-api/commit/a7f2c25)), closes [#487](https://github.com/vuejs/composition-api/issues/487)
* **watch:** check if __ob__ has value before addSub ([#477](https://github.com/vuejs/composition-api/issues/477)) ([d8cd30d](https://github.com/vuejs/composition-api/commit/d8cd30d))



<a name="1.0.0-beta.10"></a>
# [1.0.0-beta.10](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-08-15)


### Bug Fixes

* **watch:** check if __ob__ has value before addSub ([#477](https://github.com/vuejs/composition-api/issues/477)) ([d8cd30d](https://github.com/vuejs/composition-api/commit/d8cd30d))



<a name="1.0.0-beta.9"></a>
# [1.0.0-beta.9](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-08-11)


### Bug Fixes

* **watch:** watch will trigger when added new keys using `set` ([#468](https://github.com/vuejs/composition-api/issues/468)) ([13bfed1](https://github.com/vuejs/composition-api/commit/13bfed1))



<a name="1.0.0-beta.8"></a>
# [1.0.0-beta.8](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2020-08-07)


### Bug Fixes

* SSR renderComponent computed error, [#464](https://github.com/vuejs/composition-api/issues/464) ([#465](https://github.com/vuejs/composition-api/issues/465)) ([123e60e](https://github.com/vuejs/composition-api/commit/123e60e))

<a name="1.0.0-beta.7"></a>
# [1.0.0-beta.7](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2020-08-07)

### BREAKING CHANGES

* template auto ref unwrapping are now applied shallowly,
i.e. only at the root level. See https://github.com/vuejs/vue-next/pull/1682 for
more details.


### Features

* `proxyRefs` method and `ShallowUnwrapRefs` type ([#456](https://github.com/vuejs/composition-api/issues/456)) ([149821a](https://github.com/vuejs/composition-api/commit/149821a))


### Performance Improvements

* more light-weight computed ([#452](https://github.com/vuejs/composition-api/issues/452)) ([95d87f1](https://github.com/vuejs/composition-api/commit/95d87f1))



<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2020-07-22)


### Features

* **shallowReadonly:** add shallowReadonly and set computed to be shallowReadonly ([#447](https://github.com/vuejs/composition-api/issues/447)) ([cfbbcec](https://github.com/vuejs/composition-api/commit/cfbbcec))



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-07-20)



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-07-18)


### Bug Fixes

* **IE11:** replace `startsWith` to be IE11 compatible ([#442](https://github.com/vuejs/composition-api/issues/442)) ([b31c74a](https://github.com/vuejs/composition-api/commit/b31c74a))
* **type:** fix tying issues in [#428](https://github.com/vuejs/composition-api/issues/428) ([#444](https://github.com/vuejs/composition-api/issues/444)) ([98c7041](https://github.com/vuejs/composition-api/commit/98c7041))


### Features

* ie11 isReactive fix ([#441](https://github.com/vuejs/composition-api/issues/441)) ([e8ea208](https://github.com/vuejs/composition-api/commit/e8ea208))



<a name="1.0.0-beta.3"></a>
# [1.0.0-beta.3](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2020-07-09)


### Bug Fixes

* unwrap warning, fix [#425](https://github.com/vuejs/composition-api/issues/425) ([#430](https://github.com/vuejs/composition-api/issues/430)) ([d5123ec](https://github.com/vuejs/composition-api/commit/d5123ec))



<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/vuejs/composition-api/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2020-07-05)


### Bug Fixes

* prevent multiple plugins get installed ([#427](https://github.com/vuejs/composition-api/issues/427)) ([94d4d87](https://github.com/vuejs/composition-api/commit/94d4d87))
* remove "browser" field in package.json ([#424](https://github.com/vuejs/composition-api/issues/424)) ([4ebeda4](https://github.com/vuejs/composition-api/commit/4ebeda4))
* toRaw typo ([#429](https://github.com/vuejs/composition-api/issues/429)) ([9468f72](https://github.com/vuejs/composition-api/commit/9468f72))


### Features

* add customRef ([#423](https://github.com/vuejs/composition-api/issues/423)) ([a8686bb](https://github.com/vuejs/composition-api/commit/a8686bb))
* add useCSSModule api ([#420](https://github.com/vuejs/composition-api/issues/420)) ([1ceac1d](https://github.com/vuejs/composition-api/commit/1ceac1d))



<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/vuejs/composition-api/compare/v0.6.7...v1.0.0-beta.1) (2020-06-30)

## BREAKING CHANGES
* change umd exported name to `VueCompositionAPI` ([#399](https://github.com/vuejs/composition-api/issues/399))
* rename `createElement` to `h` ([#400](https://github.com/vuejs/composition-api/issues/400))
* drop `createComponent` ([#389](https://github.com/vuejs/composition-api/issues/389))
* match dist file naming with vue-next ([#413](https://github.com/vuejs/composition-api/issues/413))

### Bug Fixes

* **unwrapRef:** copy __ob__ and make toRaw work in props ([#409](https://github.com/vuejs/composition-api/issues/409)) ([5f23886](https://github.com/vuejs/composition-api/commit/5f23886)), closes [#392](https://github.com/vuejs/composition-api/issues/392)
* nextTick await ([#414](https://github.com/vuejs/composition-api/issues/414)) ([85ffede](https://github.com/vuejs/composition-api/commit/85ffede))
* **type:** accept undefined return for setup() ([#417](https://github.com/vuejs/composition-api/issues/417)) ([64b16ff](https://github.com/vuejs/composition-api/commit/64b16ff))


### Features

* add createApp ([#415](https://github.com/vuejs/composition-api/issues/415)) ([391a0d9](https://github.com/vuejs/composition-api/commit/391a0d9))
* Vue version warning in dev mode ([#408](https://github.com/vuejs/composition-api/issues/408)) ([0840aa8](https://github.com/vuejs/composition-api/commit/0840aa8))



<a name="0.6.7"></a>
## [0.6.7](https://github.com/vuejs/composition-api/compare/v0.6.6...v0.6.7) (2020-06-24)


### Bug Fixes

* **toRefs:** do not warn when toRefs is called in a prop value ([#405](https://github.com/vuejs/composition-api/issues/405)) ([048b6d3](https://github.com/vuejs/composition-api/commit/048b6d3))
* **type:** improve defineComponent type for option apis ([#406](https://github.com/vuejs/composition-api/issues/406)) ([1c64108](https://github.com/vuejs/composition-api/commit/1c64108))


### Features

* auto install when using CDN ([#403](https://github.com/vuejs/composition-api/issues/403)) ([77ba15b](https://github.com/vuejs/composition-api/commit/77ba15b))
* export nextTick ([#401](https://github.com/vuejs/composition-api/issues/401)) ([d70c904](https://github.com/vuejs/composition-api/commit/d70c904))



<a name="0.6.6"></a>
## [0.6.6](https://github.com/vuejs/composition-api/compare/v0.6.5...v0.6.6) (2020-06-21)


### Reverts

* [#387](https://github.com/vuejs/composition-api/issues/387) ([#395](https://github.com/vuejs/composition-api/issues/395)) ([b9fab71](https://github.com/vuejs/composition-api/commit/b9fab71))



<a name="0.6.5"></a>
## [0.6.5](https://github.com/vuejs/composition-api/compare/v0.6.4...v0.6.5) (2020-06-19)


### Bug Fixes

* **watchEffect:** prevent recursive calls when using `flush:sync` ([#389](https://github.com/vuejs/composition-api/issues/389)) ([f7f1e77](https://github.com/vuejs/composition-api/commit/f7f1e77))
* not unwrapping `markRaw` objects ([#386](https://github.com/vuejs/composition-api/issues/386)) ([575d100](https://github.com/vuejs/composition-api/commit/575d100))
* unwrap refs returned by `data` ([#387](https://github.com/vuejs/composition-api/issues/387)) ([1f07075](https://github.com/vuejs/composition-api/commit/1f07075))



<a name="0.6.4"></a>
## [0.6.4](https://github.com/vuejs/composition-api/compare/v0.6.3...v0.6.4) (2020-06-16)


### Bug Fixes

* **setup:** call stack exceeded when returning circular dependency ([#380](https://github.com/vuejs/composition-api/issues/380)) ([66f58ba](https://github.com/vuejs/composition-api/commit/66f58ba))
* **setup:** Vue.extend(Comp).extend({}) - vue-test-utils ([#383](https://github.com/vuejs/composition-api/issues/383)) ([ce932bf](https://github.com/vuejs/composition-api/commit/ce932bf))



<a name="0.6.3"></a>
## [0.6.3](https://github.com/vuejs/composition-api/compare/v0.6.2...v0.6.3) (2020-06-12)


### Bug Fixes

* unwrapRefProxy native objects handling ([#376](https://github.com/vuejs/composition-api/issues/376)) ([8322fc7](https://github.com/vuejs/composition-api/commit/8322fc7)), closes [#375](https://github.com/vuejs/composition-api/issues/375)



<a name="0.6.2"></a>
## [0.6.2](https://github.com/vuejs/composition-api/compare/v0.6.1...v0.6.2) (2020-06-11)


### Bug Fixes

* **reactivity:** unwrap nested refs on the template ([#361](https://github.com/vuejs/composition-api/issues/361)) ([1fd48f5](https://github.com/vuejs/composition-api/commit/1fd48f5))
* defineComponent() with array props ([#364](https://github.com/vuejs/composition-api/issues/364)) ([d7048d4](https://github.com/vuejs/composition-api/commit/d7048d4))
* **setup:** Allow retuning frozen objects on the setup ([#366](https://github.com/vuejs/composition-api/issues/366)) ([bca3a69](https://github.com/vuejs/composition-api/commit/bca3a69))
* mark props as reactive ([#359](https://github.com/vuejs/composition-api/issues/359)) ([bc78428](https://github.com/vuejs/composition-api/commit/bc78428))

# 0.6.1

## Fix

- `__DEV__` is not defined, #355, @yoyo930021

# 0.6.0

Great thanks to @pikax for #311, making most of the APIs better aligned with the latest vue-next.

## BREAKING CHANGE

- The `lazy` option of `watch` has been replaced by the opposite `immediate` option, which defaults to false. (It's ignored when using the effect signature). [more details](https://github.com/vuejs/vue-next/blob/master/CHANGELOG.md#breaking-changes-12) (#266)
- Rename `nonReactive` to `markRaw` 
- `watchEffect` now follows the same behaviour as v3 (triggers immediately).
- `UnwrapRef` types from `vue-next` this can cause some incompatibilities.

## Bug Fixes

- Added missing reactivity API from vue-next, #311, @pikax 
- Fix return type of `toRefs`, #315
- Fix incorrect ref typing, #344, @antfu
- Binding context vm when using function without parentheses, #148, @pikax
- **computed**: destroy helper vm of computed to prevent memleak, #277, @LinusBorg 
- Remove the surplus Function type from PropType, #352, @pikax

## Features

- Added `unref`(#309), `isReactive` (#327), `toRef` (#313), `UnwrapRef` (#247)
- Added `shallowReactive`, `shallowRef`
- Added `toRaw` 
- `getCurrentInstance` available on the lifecycle hooks (`onMounted`, etc)
- `getCurrentInstance` returns `undefined` when called outside setup instead of throwing exception

## Types

- Align reactivity types with `vue-next`


# 0.5.0

- New: `watchEffect` function, lingin up with the latest version of the RFC ([RFC docs](https://vue-composition-api-rfc.netlify.com/api.html#watcheffect)) (#275)
- Fix: `setup` from a mixin should called before the component's own (#276)
- Fix(types): Fix corner case in `UnWrapRef` internal type (#261)
- types: Add `Element` to bailout types for unwrapping (#278)

# 0.4.0

- **Refactor: rename `createComponent` to `defineComponent`** (the `createComponent` function is still there but deprecated) [#230](https://github.com/vuejs/composition-api/issues/230)
- Fix: correct the symbol check; fixes the compatibility issue in iOS 9 [#218](https://github.com/vuejs/composition-api/pull/218)
- Fix: avoid accessing undeclared instance fields on type-level; fixes Vetur template type checking; fixes vue-router type compatibility [#189](https://github.com/vuejs/composition-api/pull/189)
- Fix: `onUnmounted` should not be run on `deactivated` [#217](https://github.com/vuejs/composition-api/pull/217)

# 0.3.4

- Fixed `reactive` setter not working on the server.
- New `isServer` setup context property.

# 0.3.3

- Fixed make `__ob__` unenumerable [#149](https://github.com/vuejs/composition-api/issues/149).
- Fixed computed type
- Expose `getCurrentInstance` for advanced usage in Vue plugins.
- New `onServerPrefetch` lifecycle hook and new `ssrContext` setup context property [#198](https://github.com/vuejs/composition-api/issues/198).

# 0.3.2

- Improve TypeScript type infer for `props` option [#106](https://github.com/vuejs/composition-api/issues/106).
- Fix return type of `createComponent` not being compatible with `vue-router` [#130](https://github.com/vuejs/composition-api/issues/130).
- Expose `listeners` on `SetupContext` [#132](https://github.com/vuejs/composition-api/issues/132).

# 0.3.1

- Fix cleaup callback not running when watcher stops [#113](https://github.com/vuejs/composition-api/issues/113).
- Fix watcher callback not flushing at right timing [#120](https://github.com/vuejs/composition-api/issues/120).

# 0.3.0

- Improve TypeScript type definitions.
- Fix `context.slots` not being available before render [#84](https://github.com/vuejs/composition-api/issues/84).

## Changed

The `render` function returned from `setup` no longer receives any parameters.

### Previous

```js
export default {
  setup() {
    return props => h('div', prop.msg);
  },
};
```

### Now

```js
export default {
  setup(props) {
    return () => h('div', prop.msg);
  },
};
```

# 0.2.1

- Declare your expected prop types directly in TypeScript:

  ```js
  import { createComponent, createElement as h } from '@vue/composition-api';

  interface Props {
    msg: string;
  }

  const MyComponent =
    createComponent <
    Props >
    {
      props: {
        msg: {}, // required by vue 2 runtime
      },
      setup(props) {
        return () => h('div', props.msg);
      },
    };
  ```

- Declare ref type in TypeScript:
  ```js
  const dateRef = ref < Date > new Date();
  ```
- Fix `createComponent` not working with `import()` [#81](https://github.com/vuejs/composition-api/issues/81).
- Fix `inject` type declaration [#83](https://github.com/vuejs/composition-api/issues/83).

# 0.2.0

## Fixed

- `computed` property is called immediately in `reactive()` [#79](https://github.com/vuejs/composition-api/issues/79).

## Changed

- rename `onBeforeDestroy()` to `onBeforeUnmount()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
- Remove `onCreated()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).
- Remove `onDestroyed()` [lifecycle-hooks](https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks).

# 0.1.0

**The package has been renamed to `@vue/composition-api` to be consistent with RFC.**

The `@vue/composition-api` reflects the [Composition API](https://vue-composition-api-rfc.netlify.com/) RFC.

# 2.2.0

- Improve typescript support.
- Export `createElement`.
- Export `SetupContext`.
- Support returning a render function from `setup`.
- Allow string keys in `provide`/`inject`.

# 2.1.2

- Remove auto-unwrapping for Array ([#53](https://github.com/vuejs/composition-api/issues/53)).

# 2.1.1

- Export `set()` function. Using exported `set` whenever you need to use [Vue.set](https://vuejs.org/v2/api/#Vue-set) or [vm.\$set](https://vuejs.org/v2/api/#vm-set). The custom `set` ensures that auto-unwrapping works for the new property.
- Add a new signature of `provide`: `provide(key, value)`.
- Fix multiple `provide` invoking per component.
- Fix order of `setup` invoking.
- `onErrorCaptured` not triggered ([#25](https://github.com/vuejs/composition-api/issues/25)).
- Fix `this` losing in nested setup call ([#38](https://github.com/vuejs/composition-api/issues/38)).
- Fix some edge cases of unwarpping.
- Change `context.slots`'s value. It now proxies to `$scopeSlots` instead of `$slots`.

# 2.0.6

## Fixed

- watch callback is called repeatedly with multi-sources

## Improved

- reduce `watch()` memory overhead

# 2.0.0

Implement the [newest version of RFC](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md)

## Breaking Changes

`this` is not available inside `setup()`. See [setup](https://github.com/vuejs/rfcs/blob/function-apis/active-rfcs/0000-function-api.md#the-setup-function) for details.

## Features

Complex Prop Types:

```ts
import { createComponent, PropType } from 'vue';

createComponent({
  props: {
    options: (null as any) as PropType<{ msg: string }>,
  },
  setup(props) {
    props.options; // { msg: string } | undefined
  },
});
```

# 1.x

Implement the [init version of RFC](https://github.com/vuejs/rfcs/blob/903f429696524d8f93b4976d5b09dfb3632e89ef/active-rfcs/0000-function-api.md)
