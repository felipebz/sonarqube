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
package org.sonar.server.computation.task.projectanalysis.source;

import difflib.myers.MyersDiff;
import difflib.myers.PathNode;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class SourceLinesDiffFinder {

  private final List<String> database;
  private final List<String> report;

  public SourceLinesDiffFinder(List<String> database, List<String> report) {
    this.database = database;
    this.report = report;
  }

  public Set<Integer> findNewOrChangedLines() {
    Set<Integer> addedLines = new LinkedHashSet<>();

    try {
      PathNode node = MyersDiff.buildPath(database.toArray(), report.toArray());
      while (node != null) {
        PathNode prevNode = node.prev;
        if (prevNode != null && !node.isSnake()) {
          int row1 = prevNode.j;
          int row2 = node.j;

          for (int i = row1 + 1; i <= row2; i++) {
            addedLines.add(i);
          }
        }
        node = prevNode;
      }
    } catch (Exception e) {
      return IntStream.rangeClosed(1, report.size()).boxed().collect(Collectors.toSet());
    }
    return addedLines;
  }
}
