/*
* SonarQube
* Copyright (C) 2009-2018 SonarSource SA
* mailto:info AT sonarsource DOT com
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 3 of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program; if not, write to the Free Software Foundation,
* Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
import {
  RawQuery,
  parseAsString,
  parseAsArray,
  serializeString,
  serializeStringArray,
  cleanQuery,
  queriesEqual,
  parseAsDate,
  serializeDateShort,
  parseAsOptionalBoolean,
  serializeOptionalBoolean,
  parseAsOptionalString
} from '../../helpers/query';

export enum Inheritance {
  NotInherited = 'NONE',
  Inherited = 'INHERITED',
  Overridden = 'OVERRIDES'
}

export interface Query {
  activation: boolean | undefined;
  activationSeverities: string[];
  availableSince: Date | undefined;
  compareToProfile: string | undefined;
  inheritance: Inheritance | undefined;
  languages: string[];
  profile: string | undefined;
  repositories: string[];
  severities: string[];
  statuses: string[];
  tags: string[];
  template: boolean | undefined;
  types: string[];
}

export type FacetKey = keyof Query;

export interface Facet {
  [value: string]: number;
}

export type Facets = { [F in FacetKey]?: Facet };

export type OpenFacets = { [F in FacetKey]?: boolean };

export interface Activation {
  inherit: string;
  severity: string;
}

export interface Actives {
  [rule: string]: {
    [profile: string]: Activation;
  };
}

export function parseQuery(query: RawQuery): Query {
  return {
    activation: parseAsOptionalBoolean(query.activation),
    activationSeverities: parseAsArray(query.active_severities, parseAsString),
    availableSince: parseAsDate(query.available_since),
    compareToProfile: parseAsOptionalString(query.compareToProfile),
    inheritance: parseAsInheritance(query.inheritance),
    languages: parseAsArray(query.languages, parseAsString),
    profile: parseAsOptionalString(query.qprofile),
    repositories: parseAsArray(query.repositories, parseAsString),
    severities: parseAsArray(query.severities, parseAsString),
    statuses: parseAsArray(query.statuses, parseAsString),
    tags: parseAsArray(query.tags, parseAsString),
    template: parseAsOptionalBoolean(query.is_template),
    types: parseAsArray(query.types, parseAsString)
  };
}

export function serializeQuery(query: Query): RawQuery {
  /* eslint-disable camelcase */
  return cleanQuery({
    activation: serializeOptionalBoolean(query.activation),
    active_severities: serializeStringArray(query.activationSeverities),
    available_since: serializeDateShort(query.availableSince),
    compareToProfile: serializeString(query.compareToProfile),
    inheritance: serializeInheritance(query.inheritance),
    is_template: serializeOptionalBoolean(query.template),
    languages: serializeStringArray(query.languages),
    qprofile: serializeString(query.profile),
    repositories: serializeStringArray(query.repositories),
    severities: serializeStringArray(query.severities),
    statuses: serializeStringArray(query.statuses),
    tags: serializeStringArray(query.tags),
    types: serializeStringArray(query.types)
  });
  /* eslint-enable camelcase */
}

export function areQueriesEqual(a: RawQuery, b: RawQuery) {
  return queriesEqual(a, b);
}

export function shouldRequestFacet(facet: FacetKey) {
  const facetsToRequest = [
    'activationSeverities',
    'languages',
    'repositories',
    'statuses',
    'tags',
    'types'
  ];
  return facetsToRequest.includes(facet);
}

export function getServerFacet(facet: FacetKey) {
  return facet === 'activationSeverities' ? 'active_severities' : facet;
}

export function getAppFacet(serverFacet: string): FacetKey {
  return serverFacet === 'active_severities' ? 'activationSeverities' : (serverFacet as FacetKey);
}

function parseAsInheritance(value?: string): Inheritance | undefined {
  if (value === Inheritance.Inherited) {
    return Inheritance.Inherited;
  } else if (value === Inheritance.NotInherited) {
    return Inheritance.NotInherited;
  } else if (value === Inheritance.Overridden) {
    return Inheritance.Overridden;
  } else {
    return undefined;
  }
}

function serializeInheritance(value: Inheritance | undefined): string | undefined {
  return value;
}
