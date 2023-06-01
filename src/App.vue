<script setup lang="ts">
import {
  onMounted,
  ref,
  watch,
  type Ref,
} from 'vue';
import axios from 'axios';

interface DataType {
  date: string;
  data: DataListType[];
}

interface DataListType {
  id: string;
  title: string;
  norm: string;
  area: string;
  msg: string;
  price: string;
  href: string;
}

// state
const data: Ref<DataType[]> = ref([]);
const dataList: Ref<DataListType[]> = ref([]);
const dateSelect = ref('');
const dateOpt = ref([]);

const getData = async () => {
  try {
    const out = await axios.get('./data/data.json');

    data.value = out.data;
    dataList.value = out.data[0].data;
    dateSelect.value = out.data[0].date;
    dateOpt.value = out.data.map((i: { date: string }) => i.date);
  } catch (error) {
    console.error('無法取得資料:', error);
  }
};

onMounted(() => {
  getData();
});

watch([dateSelect], () => {
  data.value.forEach((d) => {
    if (d.date === dateSelect.value) {
      dataList.value = d.data;
    }
  });
});

</script>

<template>
  <header>
    <el-select v-model="dateSelect" placeholder="取得資料日期" size="large" class="date-select">
      <el-option
        v-for="d in dateOpt"
        :key="d"
        :label="d"
        :value="d"
      />
  </el-select>


  </header>

  <main>
    <el-table :data="dataList" stripe style="width: 100%">
      <el-table-column prop="title" label="標題" width="250">
        <template #default="scope">
          <el-link :href="scope.row.href" target="_blank" type="primary">{{ scope.row.title }}</el-link>
      </template>
      </el-table-column>
      <el-table-column prop="price" label="價格" width="120" />
      <el-table-column prop="norm" label="規格" width="180" />
      <el-table-column prop="area" label="地區" width="250" />
      <el-table-column prop="msg" label="更新時間" />
  </el-table>
</main>
</template>

<style scoped>
.date-select {
  margin-bottom: 20px;
}
</style>
