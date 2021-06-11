/*
 * Copyright 2013-2021 Erudika. https://erudika.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For issues and patches go to: https://github.com/erudika
 */
'use strict';

/**
 * This class stores pagination data. It limits the results for queries in the DAO
 * and Search objects and also counts the total number of results that are returned.
 * @author Alex Bogdanovski [alex@erudika.com]
 * @param {Number} page page number to start from
 * @param {String} sortby sort by field
 * @param {Boolean} desc sort in descending or ascending order
 * @param {Number} limit limits the results
 *
 * @property {Number} count the total number of results
 * @property {String} lastKey reserved use
 * @property {Array} select selected fields filter for returning only part of an object
 * @returns {Pager} a pager
 */
export default class Pager {
  constructor(page, sortby, desc, limit) {
    this.page = page || 1;
    this.count = 0;
    this.sortby = sortby || null;
    this.desc = desc || true;
    this.limit = limit || 30;
    this.name = "";
    this.lastKey = null;
    this.select = null; // [field1,field2]
  }
}
