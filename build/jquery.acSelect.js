(function($) {
  return $.fn.acSelect = function(options) {
    var acContainer, acName, acSelectData, acSelectedItemHtml, addLabel, data, loadData, preselectedData, select, settings, sortDataByLabel, updateSelectedItems;
    select = this;
    acName = select.attr('id');
    acSelectData = "" + acName + "_data";
    acContainer = select.parent().attr('id', "ac-container-" + acName);
    data = {};
    data[acSelectData] = [];
    if (select.is('input')) {
      select.addClass("" + acName + "-input");
    } else {
      select.hide();
      acContainer.append("<input type='text' placeholder='Search any term...' class='" + acName + "-input'>");
    }
    sortDataByLabel = function(data) {
      return data.sort(function(a, b) {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
    };
    addLabel = function(acData, label) {
      $.map(acData, function(item) {
        return $.extend(item, {
          label: item[label]
        });
      });
      return acData;
    };
    loadData = function(select) {
      $(select.find('option').not(':selected')).each(function(index, item) {
        var newItem;
        newItem = {};
        newItem['id'] = $(item).val();
        newItem['label'] = $(item).text();
        newItem['image'] = $(item).data('image');
        return data[acSelectData].push(newItem);
      });
      return data[acSelectData];
    };
    settings = $.extend({
      acLabel: 'label',
      acImage: 'image',
      acSelectData: loadData(this),
      acPreSelectData: null
    }, options);
    data[acSelectData] = settings.acSelectData;
    if (settings.acLabel !== 'label') {
      data[acSelectData] = addLabel(data[acSelectData], settings.acLabel);
    }
    data[acSelectData] = sortDataByLabel(data[acSelectData]);
    acSelectedItemHtml = function(item) {
      return "<li class='ac-item' id=\"ac-item-" + item.id + "\" data-id=" + item.id + "><a>" + (item[settings.acImage] ? "<img src=" + item[settings.acImage] + ">" : '') + "<span class='ac-item-label'>" + item.label + "</span> <span class='ac-remove-item'>×</span></a></li>";
    };
    if (settings.acPreSelectData) {
      preselectedData = settings.acPreSelectData;
    } else {
      preselectedData = select.find("option:selected");
    }
    if (preselectedData.length > 0 && acContainer.find("ul.ac-items-list").length === 0) {
      acContainer.append("<ul class='ac-items-list'></ul>");
    }
    $(preselectedData).each(function(index, item) {
      var preselectedItem;
      preselectedItem = {};
      if ($(item).is('option')) {
        preselectedItem['id'] = $(item).val();
        preselectedItem['label'] = $(item).text();
        preselectedItem['image'] = $(item).data('image');
      } else {
        preselectedItem['id'] = item.id;
        preselectedItem['label'] = preselectedItem[settings.acLabel] = item[settings.acLabel];
        preselectedItem[settings.acImage] = item[settings.acImage];
      }
      return acContainer.find('ul.ac-items-list').append(acSelectedItemHtml(preselectedItem));
    });
    updateSelectedItems = function(acContainer, acName, item) {
      select.find("option[value=" + item.id + "]").prop('selected', true);
      if (acContainer.find("ul.ac-items-list").length === 0) {
        acContainer.append("<ul class='ac-items-list'></ul>");
      }
      return acContainer.find('ul.ac-items-list').append(acSelectedItemHtml(item));
    };
    acContainer.find("." + acName + "-input").autocomplete({
      delay: 100,
      minLength: 0,
      source: data[acSelectData],
      close: function(event, ui) {
        if ($(this).hasClass("ac-item-selected")) {
          $(this).val('');
          return $(this).removeClass("ac-item-selected");
        }
      },
      select: function(event, ui) {
        $(this).addClass("ac-item-selected");
        updateSelectedItems(acContainer, acName, ui.item);
        return $(data[acSelectData]).each(function(index, item) {
          if (item.id === ui.item.id) {
            return data[acSelectData].splice(index, 1);
          }
        });
      }
    }).data("ui-autocomplete")._renderItem = function(ul, item) {
      $(ul).addClass("ac-results ac-" + acName + "-results");
      return $("<li>").addClass("ac-result-item").append("<a>" + (item[settings.acImage] ? "<img src=" + item[settings.acImage] + ">" : "") + "<span>" + item.label + "</span></a>").appendTo(ul);
    };
    return acContainer.on('click', ".ac-remove-item", function(e) {
      var item, selectedItem;
      selectedItem = $(this).closest('li');
      item = {};
      item['id'] = selectedItem.data('id');
      item['label'] = item[settings.acLabel] = selectedItem.find('.ac-item-label').text();
      item[settings.acImage] = selectedItem.find('img').attr('src');
      data[acSelectData].push(item);
      data[acSelectData] = sortDataByLabel(data[acSelectData]);
      select.find("option[value=" + item.id + "]").prop('selected', false);
      if (selectedItem.siblings().length === 0) {
        return selectedItem.parent().remove();
      } else {
        return selectedItem.remove();
      }
    });
  };
})(jQuery);
