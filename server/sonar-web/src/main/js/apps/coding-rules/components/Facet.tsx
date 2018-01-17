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
import * as React from 'react';
import { orderBy, without, sortBy } from 'lodash';
import { Query, FacetKey } from '../query';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import { translate } from '../../../helpers/l10n';
import { formatMeasure } from '../../../helpers/measures';

export interface BasicProps {
  onChange: (changes: Partial<Query>) => void;
  onToggle: (facet: FacetKey) => void;
  open: boolean;
  stats?: { [x: string]: number };
  values: string[];
}

interface Props extends BasicProps {
  halfWidth?: boolean;
  options?: string[];
  property: FacetKey;
  renderFooter?: () => React.ReactNode;
  renderName?: (value: string) => React.ReactNode;
  renderTextName?: (value: string) => string;
}

export default class Facet extends React.PureComponent<Props> {
  handleItemClick = (itemValue: string) => {
    const { values } = this.props;
    const newValue = orderBy(
      values.includes(itemValue) ? without(values, itemValue) : [...values, itemValue]
    );
    this.props.onChange({ [this.props.property]: newValue });
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.props.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.props.property]: [] });
  };

  getStat = (value: string) => {
    const { stats } = this.props;
    return stats && stats[value];
  };

  renderItem = (value: string) => {
    const active = this.props.values.includes(value);
    const stat = this.getStat(value);
    const { renderName = defaultRenderName } = this.props;

    return (
      <FacetItem
        active={active}
        disabled={stat === 0 && !active}
        halfWidth={this.props.halfWidth}
        key={value}
        name={renderName(value)}
        onClick={this.handleItemClick}
        stat={stat && formatMeasure(stat, 'SHORT_INT')}
        value={value}
      />
    );
  };

  render() {
    const { renderTextName = defaultRenderName, stats } = this.props;
    const values = this.props.values.map(renderTextName);
    const items =
      this.props.options ||
      (stats &&
        sortBy(Object.keys(stats), key => -stats[key], key => renderTextName(key).toLowerCase()));

    return (
      <FacetBox>
        <FacetHeader
          name={translate('coding_rules.facet', this.props.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={values}
        />

        {this.props.open &&
          items !== undefined && <FacetItemsList>{items.map(this.renderItem)}</FacetItemsList>}

        {this.props.open && this.props.renderFooter !== undefined && this.props.renderFooter()}
      </FacetBox>
    );
  }
}

function defaultRenderName(value: string) {
  return value;
}
